import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data: roleData } = await adminClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (!roleData || roleData.role !== "admin") {
      return new Response(JSON.stringify({ error: "Forbidden: Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, password, full_name, phone, company_name, role, city, address, domain, hosting, website, software } = await req.json();

    if (!email || !password) {
      return new Response(JSON.stringify({ error: "Email and password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create user
    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = newUser?.user?.id;
    if (!userId) {
      return new Response(JSON.stringify({ error: "User creation failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Update profile
    await adminClient
      .from("profiles")
      .update({ full_name, phone, company_name, city, address })
      .eq("user_id", userId);

    // Set role if not default client
    if (role && role !== "client") {
      await adminClient
        .from("user_roles")
        .update({ role })
        .eq("user_id", userId);
    }

    // Helper: generate order number
    const generateOrderNumber = () => {
      const now = new Date();
      const yy = String(now.getFullYear()).slice(-2);
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const rand = String(Math.floor(Math.random() * 999999)).padStart(6, "0");
      return `${yy}${mm}${rand}`;
    };

    // Collect package IDs to create order items for
    const packageSelections: { packageId: string; serviceTypeKey: string }[] = [];

    if (hosting && hosting !== "none" && hosting !== "") {
      packageSelections.push({ packageId: hosting, serviceTypeKey: "hosting" });
    }
    if (website && website !== "none" && website !== "") {
      packageSelections.push({ packageId: website, serviceTypeKey: "web_development" });
    }
    if (software && software !== "none" && software !== "") {
      packageSelections.push({ packageId: software, serviceTypeKey: "software_development" });
    }

    let createdOrderId: string | null = null;

    if (packageSelections.length > 0) {
      // Fetch all package details
      const packageDetails: { id: string; name_en: string; price: number; service_id: string; serviceTypeKey: string }[] = [];
      let totalAmount = 0;

      for (const sel of packageSelections) {
        const { data: pkg } = await adminClient
          .from("service_packages")
          .select("id, name_en, name_bn, price, service_id")
          .eq("id", sel.packageId)
          .single();

        if (pkg) {
          packageDetails.push({ ...pkg, serviceTypeKey: sel.serviceTypeKey });
          totalAmount += pkg.price;
        }
      }

      if (packageDetails.length > 0) {
        const primaryPkg = packageDetails[0];
        const orderNumber = generateOrderNumber();

        // Create ONE order
        const { data: order, error: orderError } = await adminClient
          .from("orders")
          .insert({
            order_number: orderNumber,
            user_id: userId,
            service_id: primaryPkg.service_id,
            package_id: primaryPkg.id,
            service_type: primaryPkg.serviceTypeKey,
            billing_type: "one_time",
            subtotal: totalAmount,
            discount: 0,
            tax: 0,
            total: totalAmount,
            advance_payment: 0,
            status: "pending",
            notes: `Auto-created with customer by admin. ${packageDetails.length} service(s).`,
            admin_notes: `Created by admin (${caller.email}) during customer onboarding`,
          })
          .select("id")
          .single();

        if (order) {
          createdOrderId = order.id;

          // Create order_items for each package
          const orderItems = packageDetails.map(pkg => ({
            order_id: order.id,
            service_type: pkg.serviceTypeKey,
            package_name: pkg.name_en,
            billing_type: pkg.serviceTypeKey === "hosting" ? "recurring" : "one_time",
            price: pkg.price,
            qty: 1,
            total: pkg.price,
            description: `${pkg.name_en} (${pkg.serviceTypeKey})`,
          }));

          await adminClient.from("order_items").insert(orderItems);

          // Find auto-generated invoice and add invoice_items
          const { data: invoice } = await adminClient
            .from("invoices")
            .select("id")
            .eq("order_id", order.id)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          if (invoice) {
            const invoiceItems = packageDetails.map(pkg => ({
              invoice_id: invoice.id,
              service_type: pkg.serviceTypeKey,
              package_name: pkg.name_en,
              price: pkg.price,
              qty: 1,
              total: pkg.price,
              description: `${pkg.name_en} (${pkg.serviceTypeKey})`,
            }));

            await adminClient.from("invoice_items").insert(invoiceItems);
          }
        } else {
          console.error("Order creation error:", orderError?.message);
        }
      }
    }

    // If domain name provided, create a domain record
    if (domain && domain.trim() !== "") {
      const domainName = domain.trim().toLowerCase();
      const tldParts = domainName.split(".");
      const tld = tldParts.length > 1 ? "." + tldParts.slice(1).join(".") : ".com";

      await adminClient.from("domains").insert({
        domain_name: domainName,
        tld: tld,
        user_id: userId,
        status: "pending",
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user_id: userId, 
        orders_created: createdOrderId ? 1 : 0,
        message: `Customer created with ${createdOrderId ? '1 order (with ' + packageSelections.length + ' item(s))' : '0 orders'} and auto-generated invoice` 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
