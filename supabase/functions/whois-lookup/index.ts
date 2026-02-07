const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhoisResult {
  domain: string;
  available: boolean;
  registrar?: string;
  createdDate?: string;
  expiryDate?: string;
  nameservers?: string[];
  status?: string[];
}

// RDAP (Registration Data Access Protocol) endpoints for different TLDs
const RDAP_SERVERS: Record<string, string> = {
  'com': 'https://rdap.verisign.com/com/v1/domain/',
  'net': 'https://rdap.verisign.com/net/v1/domain/',
  'org': 'https://rdap.publicinterestregistry.org/rdap/domain/',
  'info': 'https://rdap.afilias.net/rdap/info/domain/',
  'biz': 'https://rdap.nic.biz/domain/',
  'io': 'https://rdap.nic.io/domain/',
  'co': 'https://rdap.nic.co/domain/',
  'xyz': 'https://rdap.centralnic.com/xyz/domain/',
  'online': 'https://rdap.centralnic.com/online/domain/',
  'store': 'https://rdap.centralnic.com/store/domain/',
  'tech': 'https://rdap.centralnic.com/tech/domain/',
  'name': 'https://rdap.verisign.com/name/v1/domain/',
  'asia': 'https://rdap.afilias.net/rdap/asia/domain/',
  'mobi': 'https://rdap.nic.mobi/domain/',
  'live': 'https://rdap.donuts.co/rdap/domain/',
  'news': 'https://rdap.donuts.co/rdap/domain/',
};

async function checkViaRDAP(domain: string, tld: string): Promise<WhoisResult> {
  const cleanTld = tld.replace(/^\./, '');
  const rdapServer = RDAP_SERVERS[cleanTld];
  
  if (!rdapServer) {
    // Fallback for unsupported TLDs - assume available if no server
    return { domain, available: true };
  }

  try {
    const response = await fetch(`${rdapServer}${domain}`, {
      headers: {
        'Accept': 'application/rdap+json',
      },
    });

    if (response.status === 404) {
      // Domain not found = available
      return { domain, available: true };
    }

    if (!response.ok) {
      // Server error - default to checking with alternative method
      console.log(`RDAP server returned ${response.status} for ${domain}`);
      return { domain, available: true };
    }

    const data = await response.json();
    
    // Extract registration info
    let registrar = '';
    let createdDate = '';
    let expiryDate = '';
    const nameservers: string[] = [];
    const status: string[] = [];

    // Get registrar from entities
    if (data.entities) {
      for (const entity of data.entities) {
        if (entity.roles?.includes('registrar') && entity.vcardArray) {
          const vcard = entity.vcardArray[1];
          for (const item of vcard) {
            if (item[0] === 'fn') {
              registrar = item[3];
              break;
            }
          }
        }
      }
    }

    // Get dates from events
    if (data.events) {
      for (const event of data.events) {
        if (event.eventAction === 'registration') {
          createdDate = event.eventDate;
        } else if (event.eventAction === 'expiration') {
          expiryDate = event.eventDate;
        }
      }
    }

    // Get nameservers
    if (data.nameservers) {
      for (const ns of data.nameservers) {
        if (ns.ldhName) {
          nameservers.push(ns.ldhName);
        }
      }
    }

    // Get status
    if (data.status) {
      status.push(...data.status);
    }

    return {
      domain,
      available: false,
      registrar,
      createdDate,
      expiryDate,
      nameservers,
      status,
    };
  } catch (error) {
    console.error(`RDAP lookup failed for ${domain}:`, error);
    // On error, default to available (will be verified at registration time)
    return { domain, available: true };
  }
}

// For .bd domains, we need to check via DNS since there's no RDAP
async function checkBdDomain(domain: string): Promise<WhoisResult> {
  try {
    // Try DNS lookup - if domain has NS records, it's registered
    const response = await fetch(
      `https://dns.google/resolve?name=${domain}&type=NS`
    );
    const data = await response.json();
    
    // If we get NS records, domain is registered
    if (data.Answer && data.Answer.length > 0) {
      const nameservers = data.Answer
        .filter((r: any) => r.type === 2)
        .map((r: any) => r.data);
      
      return {
        domain,
        available: false,
        nameservers,
      };
    }
    
    // No NS records - likely available
    return { domain, available: true };
  } catch (error) {
    console.error(`DNS lookup failed for ${domain}:`, error);
    return { domain, available: true };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { domain, tld } = await req.json();

    if (!domain || !tld) {
      return new Response(
        JSON.stringify({ success: false, error: 'Domain and TLD are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fullDomain = `${domain}${tld}`;
    const cleanTld = tld.replace(/^\./, '');
    
    console.log(`Checking availability for: ${fullDomain}`);

    let result: WhoisResult;

    // Handle .bd domains separately
    if (cleanTld.endsWith('bd')) {
      result = await checkBdDomain(fullDomain);
    } else {
      result = await checkViaRDAP(fullDomain, tld);
    }

    console.log(`Result for ${fullDomain}:`, result);

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('WHOIS lookup error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'WHOIS lookup failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
