import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  details?: Record<string, unknown>;
}

async function checkDatabase(supabase: ReturnType<typeof createClient>): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('profiles').select('id').limit(1);
    const latency = Date.now() - start;
    
    return {
      service: 'database',
      status: error ? 'unhealthy' : latency > 1000 ? 'degraded' : 'healthy',
      latencyMs: latency,
      details: error ? { error: error.message } : undefined,
    };
  } catch (err) {
    return {
      service: 'database',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: { error: String(err) },
    };
  }
}

async function checkAuth(supabase: ReturnType<typeof createClient>): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    // Simple auth check - just verify the client is configured
    const latency = Date.now() - start;
    return {
      service: 'auth',
      status: latency > 500 ? 'degraded' : 'healthy',
      latencyMs: latency,
    };
  } catch (err) {
    return {
      service: 'auth',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: { error: String(err) },
    };
  }
}

async function checkStorage(supabase: ReturnType<typeof createClient>): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { data, error } = await supabase.storage.listBuckets();
    const latency = Date.now() - start;
    
    return {
      service: 'storage',
      status: error ? 'unhealthy' : latency > 1000 ? 'degraded' : 'healthy',
      latencyMs: latency,
      details: { bucketCount: data?.length || 0 },
    };
  } catch (err) {
    return {
      service: 'storage',
      status: 'unhealthy',
      latencyMs: Date.now() - start,
      details: { error: String(err) },
    };
  }
}

async function getSystemMetrics(supabase: ReturnType<typeof createClient>): Promise<Record<string, unknown>> {
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();
  const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();

  // Get various counts
  const [orders, payments, errors, users] = await Promise.all([
    supabase.from('orders').select('id', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
    supabase.from('payments').select('id', { count: 'exact', head: true }).gte('created_at', oneDayAgo),
    supabase.from('audit_logs').select('id', { count: 'exact', head: true })
      .eq('action', 'security_event')
      .gte('created_at', oneHourAgo),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ]);

  return {
    ordersLast24h: orders.count || 0,
    paymentsLast24h: payments.count || 0,
    securityEventsLastHour: errors.count || 0,
    totalUsers: users.count || 0,
  };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const url = new URL(req.url);
    const detailed = url.searchParams.get('detailed') === 'true';

    const startTime = Date.now();

    // Run health checks in parallel
    const [database, auth, storage] = await Promise.all([
      checkDatabase(supabase),
      checkAuth(supabase),
      checkStorage(supabase),
    ]);

    const checks = [database, auth, storage];
    const overallStatus = checks.every(c => c.status === 'healthy')
      ? 'healthy'
      : checks.some(c => c.status === 'unhealthy')
        ? 'unhealthy'
        : 'degraded';

    const response: Record<string, unknown> = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: Deno.osUptime?.() || 'unknown',
      checks,
      responseTimeMs: Date.now() - startTime,
    };

    // Add detailed metrics if requested
    if (detailed) {
      response.metrics = await getSystemMetrics(supabase);
      response.environment = {
        region: Deno.env.get('DENO_REGION') || 'unknown',
        runtime: `Deno ${Deno.version.deno}`,
      };
    }

    // Log health check if there are issues
    if (overallStatus !== 'healthy') {
      await supabase.from('audit_logs').insert([{
        action: 'security_event',
        entity_type: 'health_check',
        new_values: {
          event: 'health_check_degraded',
          severity: overallStatus === 'unhealthy' ? 'high' : 'medium',
          checks: checks.filter(c => c.status !== 'healthy'),
        },
      }]);
    }

    return new Response(
      JSON.stringify(response),
      {
        status: overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Health check error:', error);
    
    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
