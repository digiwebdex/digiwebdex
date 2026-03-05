import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const BACKUP_EMAIL = "digiwebdex@gmail.com";

const TABLES_TO_BACKUP = [
  "profiles",
  "orders",
  "order_items",
  "invoices",
  "invoice_items",
  "payments",
  "manual_payments",
  "domains",
  "hosting_accounts",
  "projects",
  "project_milestones",
  "affiliates",
  "affiliate_commissions",
  "affiliate_withdrawals",
  "affiliate_clicks",
  "blog_posts",
  "blog_categories",
  "blog_tags",
  "landing_pages",
  "location_pages",
  "case_studies",
  "coupons",
  "cart_items",
  "contact_messages",
  "consultation_bookings",
  "leads",
  "support_tickets",
  "ticket_replies",
  "notifications",
  "notification_templates",
  "services",
  "service_packages",
  "subscriptions",
  "bundle_discounts",
  "custom_fields",
  "custom_field_values",
  "domain_pricing",
  "homepage_sections",
  "sitemap_entries",
  "seo_settings",
  "system_settings",
  "user_roles",
  "role_permissions",
  "audit_logs",
];

function tableToCSV(data: Record<string, unknown>[]): string {
  if (!data || data.length === 0) return "";
  const headers = Object.keys(data[0]);
  const headerRow = headers.map((h) => `"${h}"`).join(",");
  const rows = data.map((row) =>
    headers
      .map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return '""';
        const str =
          typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(",")
  );
  return [headerRow, ...rows].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log("Starting daily CSV backup...");
    const startTime = Date.now();
    const today = new Date().toISOString().split("T")[0];
    const results: { table: string; rows: number; success: boolean; error?: string }[] = [];
    const csvAttachments: { filename: string; content: string }[] = [];

    for (const table of TABLES_TO_BACKUP) {
      try {
        // Fetch all rows (handle >1000 rows with pagination)
        let allData: Record<string, unknown>[] = [];
        let from = 0;
        const pageSize = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data, error } = await supabase
            .from(table)
            .select("*")
            .range(from, from + pageSize - 1);

          if (error) {
            results.push({ table, rows: 0, success: false, error: error.message });
            hasMore = false;
            break;
          }

          if (data && data.length > 0) {
            allData = allData.concat(data);
            from += pageSize;
            hasMore = data.length === pageSize;
          } else {
            hasMore = false;
          }
        }

        if (allData.length > 0) {
          const csv = tableToCSV(allData);
          csvAttachments.push({
            filename: `${table}_${today}.csv`,
            content: csv,
          });
        }

        results.push({ table, rows: allData.length, success: true });
        console.log(`Backed up ${table}: ${allData.length} rows`);
      } catch (err) {
        results.push({ table, rows: 0, success: false, error: String(err) });
      }
    }

    // Build email with CSV data as attachments via Resend
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const successCount = results.filter((r) => r.success).length;
    const totalRows = results.reduce((sum, r) => sum + r.rows, 0);
    const duration = Date.now() - startTime;

    // Build summary table
    const summaryRows = results
      .map(
        (r) =>
          `<tr><td style="padding:6px 12px;border:1px solid #ddd;">${r.table}</td>
           <td style="padding:6px 12px;border:1px solid #ddd;text-align:center;">${r.rows}</td>
           <td style="padding:6px 12px;border:1px solid #ddd;text-align:center;">${r.success ? "✅" : "❌ " + (r.error || "")}</td></tr>`
      )
      .join("");

    const emailHtml = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:700px;margin:0 auto;">
        <div style="background:#0F172A;color:#fff;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;font-size:20px;">📦 DigiWebDex Daily Backup Report</h1>
          <p style="margin:4px 0 0;opacity:0.8;font-size:14px;">${today}</p>
        </div>
        <div style="padding:20px 24px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;">
          <div style="display:flex;gap:16px;margin-bottom:20px;">
            <div style="background:#fff;padding:12px 20px;border-radius:6px;border:1px solid #e5e7eb;flex:1;">
              <div style="font-size:24px;font-weight:700;color:#0F172A;">${successCount}/${TABLES_TO_BACKUP.length}</div>
              <div style="font-size:12px;color:#64748b;">Tables Backed Up</div>
            </div>
            <div style="background:#fff;padding:12px 20px;border-radius:6px;border:1px solid #e5e7eb;flex:1;">
              <div style="font-size:24px;font-weight:700;color:#0F172A;">${totalRows.toLocaleString()}</div>
              <div style="font-size:12px;color:#64748b;">Total Rows</div>
            </div>
            <div style="background:#fff;padding:12px 20px;border-radius:6px;border:1px solid #e5e7eb;flex:1;">
              <div style="font-size:24px;font-weight:700;color:#0F172A;">${(duration / 1000).toFixed(1)}s</div>
              <div style="font-size:12px;color:#64748b;">Duration</div>
            </div>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:13px;background:#fff;border-radius:6px;overflow:hidden;">
            <thead><tr style="background:#f1f5f9;">
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:left;">Table</th>
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;">Rows</th>
              <th style="padding:8px 12px;border:1px solid #ddd;text-align:center;">Status</th>
            </tr></thead>
            <tbody>${summaryRows}</tbody>
          </table>
          <p style="margin-top:16px;font-size:12px;color:#94a3b8;">CSV files are attached to this email. Store them securely.</p>
        </div>
      </div>`;

    // Convert CSVs to base64 attachments for Resend API
    const encoder = new TextEncoder();
    const attachments = csvAttachments.map((att) => ({
      filename: att.filename,
      content: btoa(
        String.fromCharCode(...encoder.encode("\uFEFF" + att.content))
      ),
    }));

    // Resend has a 40MB limit; split into batches if needed
    const MAX_ATTACHMENTS_PER_EMAIL = 10;
    const batches: typeof attachments[] = [];
    for (let i = 0; i < attachments.length; i += MAX_ATTACHMENTS_PER_EMAIL) {
      batches.push(attachments.slice(i, i + MAX_ATTACHMENTS_PER_EMAIL));
    }

    for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
      const batch = batches[batchIdx];
      const batchLabel =
        batches.length > 1 ? ` (Part ${batchIdx + 1}/${batches.length})` : "";

      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "DigiWebDex Backup <noreply@digiwebdex.com>",
          to: [BACKUP_EMAIL],
          subject: `📦 Daily Backup - ${today}${batchLabel}`,
          html: batchIdx === 0 ? emailHtml : `<p>Backup CSV files${batchLabel} for ${today}. See Part 1 for the full report.</p>`,
          attachments: batch,
        }),
      });

      if (!resendRes.ok) {
        const errData = await resendRes.json();
        console.error(`Resend error (batch ${batchIdx + 1}):`, errData);
        throw new Error(`Email send failed: ${errData.message}`);
      }

      console.log(`Backup email batch ${batchIdx + 1} sent successfully`);
    }

    // Log to audit
    await supabase.from("audit_logs").insert([
      {
        action: "daily_csv_backup",
        entity_type: "backup",
        new_values: {
          tables_backed_up: successCount,
          total_rows: totalRows,
          duration_ms: duration,
          email_sent_to: BACKUP_EMAIL,
          batches: batches.length,
          timestamp: new Date().toISOString(),
        },
      },
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Backup completed. ${batches.length} email(s) sent to ${BACKUP_EMAIL}`,
        summary: { tablesBackedUp: successCount, totalRows, durationMs: duration },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Backup error:", error);

    await supabase.from("audit_logs").insert([
      {
        action: "daily_csv_backup_failed",
        entity_type: "backup",
        new_values: { error: error.message, timestamp: new Date().toISOString() },
      },
    ]);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
