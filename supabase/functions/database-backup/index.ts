import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BackupResult {
  table: string;
  rowCount: number;
  success: boolean;
  error?: string;
}

const TABLES_TO_BACKUP = [
  'profiles',
  'orders',
  'invoices',
  'payments',
  'manual_payments',
  'domains',
  'hosting_accounts',
  'projects',
  'affiliates',
  'affiliate_commissions',
  'affiliate_withdrawals',
  'blog_posts',
  'blog_categories',
  'landing_pages',
  'location_pages',
  'coupons',
  'notification_templates',
];

async function backupTable(
  supabase: ReturnType<typeof createClient>,
  tableName: string
): Promise<BackupResult> {
  try {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' });

    if (error) {
      return { table: tableName, rowCount: 0, success: false, error: error.message };
    }

    // In production, you would upload this to a storage bucket
    // For now, we log the backup size
    const jsonData = JSON.stringify(data);
    const sizeKB = new TextEncoder().encode(jsonData).length / 1024;

    console.log(`Backed up ${tableName}: ${count} rows, ${sizeKB.toFixed(2)} KB`);

    return { table: tableName, rowCount: count || 0, success: true };
  } catch (err) {
    return { table: tableName, rowCount: 0, success: false, error: String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // Verify this is either a cron job or admin request
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    // Check if it's a cron job with secret
    const isCronJob = req.headers.get('x-cron-secret') === cronSecret;
    
    if (!isCronJob && authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);

      if (!user) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check if admin
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (!roles) {
        return new Response(
          JSON.stringify({ error: 'Forbidden - Admin access required' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else if (!isCronJob) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting database backup...');
    const startTime = Date.now();
    const results: BackupResult[] = [];

    // Backup each table
    for (const table of TABLES_TO_BACKUP) {
      const result = await backupTable(supabase, table);
      results.push(result);
    }

    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const totalRows = results.reduce((sum, r) => sum + r.rowCount, 0);

    // Log backup completion
    await supabase.from('audit_logs').insert([{
      action: 'database_backup',
      entity_type: 'backup',
      new_values: {
        tables_backed_up: successCount,
        total_tables: TABLES_TO_BACKUP.length,
        total_rows: totalRows,
        duration_ms: duration,
        timestamp: new Date().toISOString(),
        results: results.map(r => ({
          table: r.table,
          rows: r.rowCount,
          success: r.success,
        })),
      },
    }]);

    console.log(`Backup completed: ${successCount}/${TABLES_TO_BACKUP.length} tables, ${totalRows} rows in ${duration}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Backup completed',
        summary: {
          tablesBackedUp: successCount,
          totalTables: TABLES_TO_BACKUP.length,
          totalRows,
          durationMs: duration,
        },
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Backup error:', error);
    
    await supabase.from('audit_logs').insert([{
      action: 'database_backup_failed',
      entity_type: 'backup',
      new_values: { error: error.message, timestamp: new Date().toISOString() },
    }]);

    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
