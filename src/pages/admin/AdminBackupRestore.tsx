import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useLanguage } from '@/lib/i18n';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Download, Upload, RefreshCw, Database, Clock, CheckCircle, XCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BackupLog {
  id: string;
  action: string;
  created_at: string;
  new_values: {
    tables_backed_up?: number;
    total_rows?: number;
    duration_ms?: number;
    email_sent_to?: string;
    batches?: number;
    timestamp?: string;
    error?: string;
    restore_table?: string;
    rows_restored?: number;
  } | null;
}

const RESTORABLE_TABLES = [
  'profiles', 'orders', 'order_items', 'invoices', 'invoice_items',
  'payments', 'manual_payments', 'domains', 'hosting_accounts',
  'projects', 'project_milestones', 'affiliates', 'affiliate_commissions',
  'blog_posts', 'blog_categories', 'blog_tags', 'landing_pages',
  'location_pages', 'case_studies', 'coupons', 'contact_messages',
  'consultation_bookings', 'leads', 'support_tickets', 'ticket_replies',
  'notification_templates', 'services', 'service_packages',
  'subscriptions', 'bundle_discounts', 'custom_fields', 'custom_field_values',
  'domain_pricing', 'homepage_sections', 'sitemap_entries', 'seo_settings',
  'system_settings',
];

export default function AdminBackupRestore() {
  const { language } = useLanguage();
  const isBn = language === 'bn';

  const [backupLogs, setBackupLogs] = useState<BackupLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringBackup, setTriggeringBackup] = useState(false);
  const [restoreOpen, setRestoreOpen] = useState(false);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreTable, setRestoreTable] = useState('');
  const [restoring, setRestoring] = useState(false);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('audit_logs')
      .select('id, action, created_at, new_values')
      .in('action', ['daily_csv_backup', 'daily_csv_backup_failed', 'database_backup', 'database_backup_failed', 'manual_backup', 'data_restore', 'data_restore_failed'])
      .order('created_at', { ascending: false })
      .limit(50);
    setBackupLogs((data as BackupLog[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const triggerManualBackup = async () => {
    setTriggeringBackup(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/daily-csv-backup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(isBn ? 'ব্যাকআপ সফল! ইমেইলে পাঠানো হয়েছে।' : 'Backup completed! Sent to email.');
      } else {
        toast.error(result.error || 'Backup failed');
      }
    } catch (err) {
      toast.error(isBn ? 'ব্যাকআপ ব্যর্থ হয়েছে' : 'Backup failed');
    } finally {
      setTriggeringBackup(false);
      fetchLogs();
    }
  };

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    
    // Parse headers
    const headers = parseCSVRow(lines[0]);
    const rows: Record<string, unknown>[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVRow(lines[i]);
      const row: Record<string, unknown> = {};
      headers.forEach((h, idx) => {
        let val: unknown = values[idx] ?? '';
        if (val === '') val = null;
        else {
          // Try parse JSON objects/arrays
          const s = val as string;
          if ((s.startsWith('{') && s.endsWith('}')) || (s.startsWith('[') && s.endsWith(']'))) {
            try { val = JSON.parse(s); } catch { /* keep as string */ }
          }
          // Parse booleans
          if (s === 'true') val = true;
          else if (s === 'false') val = false;
        }
        row[h] = val;
      });
      rows.push(row);
    }
    return rows;
  };

  const parseCSVRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          result.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    result.push(current);
    return result;
  };

  const handleRestore = async () => {
    if (!restoreFile || !restoreTable) {
      toast.error(isBn ? 'টেবিল এবং ফাইল সিলেক্ট করুন' : 'Select table and file');
      return;
    }
    setRestoring(true);
    try {
      const text = await restoreFile.text();
      // Remove BOM if present
      const cleanText = text.replace(/^\uFEFF/, '');
      const rows = parseCSV(cleanText);
      
      if (rows.length === 0) {
        toast.error(isBn ? 'CSV ফাইলে কোন ডেটা নেই' : 'No data in CSV file');
        setRestoring(false);
        return;
      }

      // For replace mode, delete existing data first
      if (restoreMode === 'replace') {
        const { error: delErr } = await supabase.from(restoreTable as any).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (delErr) {
          console.error('Delete error:', delErr);
          toast.error(`Delete failed: ${delErr.message}`);
          setRestoring(false);
          return;
        }
      }

      // Insert in batches of 100
      let inserted = 0;
      let errors = 0;
      const batchSize = 100;
      
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        const { error } = await supabase.from(restoreTable as any).upsert(batch as any, { onConflict: 'id' });
        if (error) {
          console.error(`Batch error at ${i}:`, error);
          errors++;
        } else {
          inserted += batch.length;
        }
      }

      // Log the restore
      await supabase.from('audit_logs').insert([{
        action: errors > 0 ? 'data_restore_failed' : 'data_restore',
        entity_type: 'backup',
        new_values: {
          restore_table: restoreTable,
          rows_restored: inserted,
          total_rows: rows.length,
          mode: restoreMode,
          errors,
          timestamp: new Date().toISOString(),
        } as any,
      }]);

      if (errors > 0) {
        toast.warning(isBn ? `আংশিক রিস্টোর: ${inserted}/${rows.length} সারি` : `Partial restore: ${inserted}/${rows.length} rows`);
      } else {
        toast.success(isBn ? `${inserted} সারি সফলভাবে রিস্টোর হয়েছে` : `${inserted} rows restored successfully`);
      }
      
      setRestoreOpen(false);
      setRestoreFile(null);
      setRestoreTable('');
      fetchLogs();
    } catch (err) {
      toast.error(isBn ? 'রিস্টোর ব্যর্থ হয়েছে' : 'Restore failed');
      console.error('Restore error:', err);
    } finally {
      setRestoring(false);
    }
  };

  const getStatusBadge = (action: string) => {
    if (action.includes('failed')) {
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{isBn ? 'ব্যর্থ' : 'Failed'}</Badge>;
    }
    if (action === 'data_restore') {
      return <Badge className="gap-1 bg-blue-500"><Upload className="h-3 w-3" />{isBn ? 'রিস্টোর' : 'Restored'}</Badge>;
    }
    return <Badge className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" />{isBn ? 'সফল' : 'Success'}</Badge>;
  };

  const getActionLabel = (action: string) => {
    const map: Record<string, string> = {
      daily_csv_backup: isBn ? 'স্বয়ংক্রিয় ব্যাকআপ' : 'Auto Backup',
      daily_csv_backup_failed: isBn ? 'ব্যাকআপ ব্যর্থ' : 'Backup Failed',
      database_backup: isBn ? 'ডেটাবেস ব্যাকআপ' : 'DB Backup',
      database_backup_failed: isBn ? 'ডেটাবেস ব্যাকআপ ব্যর্থ' : 'DB Backup Failed',
      manual_backup: isBn ? 'ম্যানুয়াল ব্যাকআপ' : 'Manual Backup',
      data_restore: isBn ? 'ডেটা রিস্টোর' : 'Data Restore',
      data_restore_failed: isBn ? 'রিস্টোর ব্যর্থ' : 'Restore Failed',
    };
    return map[action] || action;
  };

  // Stats from latest successful backup
  const latestBackup = backupLogs.find(l => l.action === 'daily_csv_backup');
  const latestValues = latestBackup?.new_values;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{isBn ? '🗄️ ব্যাকআপ ও রিস্টোর' : '🗄️ Backup & Restore'}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {isBn ? 'প্রতিদিন স্বয়ংক্রিয় ব্যাকআপ ও CSV থেকে রিস্টোর' : 'Daily auto backup & restore from CSV files'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setRestoreOpen(true)} className="gap-2">
              <Upload className="h-4 w-4" />
              {isBn ? 'রিস্টোর করুন' : 'Restore'}
            </Button>
            <Button onClick={triggerManualBackup} disabled={triggeringBackup} className="gap-2">
              {triggeringBackup ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              {isBn ? 'এখনই ব্যাকআপ নিন' : 'Backup Now'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><Database className="h-5 w-5 text-primary" /></div>
                <div>
                  <p className="text-2xl font-bold">{latestValues?.tables_backed_up ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{isBn ? 'টেবিল ব্যাকআপ' : 'Tables Backed Up'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10"><FileText className="h-5 w-5 text-green-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{latestValues?.total_rows?.toLocaleString() ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">{isBn ? 'মোট সারি' : 'Total Rows'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10"><Clock className="h-5 w-5 text-blue-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{latestValues?.duration_ms ? `${(latestValues.duration_ms / 1000).toFixed(1)}s` : '—'}</p>
                  <p className="text-xs text-muted-foreground">{isBn ? 'সময়কাল' : 'Duration'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/10"><RefreshCw className="h-5 w-5 text-orange-600" /></div>
                <div>
                  <p className="text-2xl font-bold">{latestBackup ? format(new Date(latestBackup.created_at), 'dd MMM') : '—'}</p>
                  <p className="text-xs text-muted-foreground">{isBn ? 'শেষ ব্যাকআপ' : 'Last Backup'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auto Backup Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              {isBn ? 'স্বয়ংক্রিয় ব্যাকআপ সেটআপ' : 'Auto Backup Schedule'}
            </CardTitle>
            <CardDescription>
              {isBn
                ? 'প্রতিদিন রাত ১২:০০ (UTC) এ সকল টেবিলের CSV ব্যাকআপ digiwebdex@gmail.com এ পাঠানো হয়।'
                : 'Daily at 00:00 UTC, all tables are backed up as CSV and emailed to digiwebdex@gmail.com.'}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Backup History */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base">{isBn ? 'ব্যাকআপ ইতিহাস' : 'Backup History'}</CardTitle>
              <Button variant="ghost" size="sm" onClick={fetchLogs} className="gap-1">
                <RefreshCw className="h-3 w-3" /> {isBn ? 'রিফ্রেশ' : 'Refresh'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
            ) : backupLogs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">{isBn ? 'কোন ব্যাকআপ লগ নেই' : 'No backup logs found'}</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{isBn ? 'তারিখ ও সময়' : 'Date & Time'}</TableHead>
                      <TableHead>{isBn ? 'ধরন' : 'Type'}</TableHead>
                      <TableHead>{isBn ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                      <TableHead>{isBn ? 'টেবিল' : 'Tables'}</TableHead>
                      <TableHead>{isBn ? 'সারি' : 'Rows'}</TableHead>
                      <TableHead>{isBn ? 'সময়কাল' : 'Duration'}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backupLogs.map((log) => {
                      const vals = log.new_values;
                      return (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm">
                            {format(new Date(log.created_at), 'dd MMM yyyy, hh:mm a')}
                          </TableCell>
                          <TableCell className="text-sm">{getActionLabel(log.action)}</TableCell>
                          <TableCell>{getStatusBadge(log.action)}</TableCell>
                          <TableCell className="text-sm">
                            {vals?.tables_backed_up ?? vals?.restore_table ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {(vals?.total_rows ?? vals?.rows_restored)?.toLocaleString() ?? '—'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {vals?.duration_ms ? `${(vals.duration_ms / 1000).toFixed(1)}s` : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Restore Modal */}
        <Dialog open={restoreOpen} onOpenChange={setRestoreOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                {isBn ? 'CSV থেকে রিস্টোর' : 'Restore from CSV'}
              </DialogTitle>
              <DialogDescription>
                {isBn
                  ? 'ব্যাকআপ ইমেইল থেকে ডাউনলোড করা CSV ফাইল আপলোড করুন।'
                  : 'Upload a CSV file downloaded from the backup email.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>{isBn ? 'টেবিল সিলেক্ট করুন' : 'Select Table'}</Label>
                <Select value={restoreTable} onValueChange={setRestoreTable}>
                  <SelectTrigger><SelectValue placeholder={isBn ? 'টেবিল বাছাই করুন...' : 'Choose table...'} /></SelectTrigger>
                  <SelectContent>
                    {RESTORABLE_TABLES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{isBn ? 'রিস্টোর মোড' : 'Restore Mode'}</Label>
                <Select value={restoreMode} onValueChange={(v) => setRestoreMode(v as 'merge' | 'replace')}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="merge">{isBn ? 'মার্জ (বিদ্যমান ডেটা রাখুন)' : 'Merge (keep existing)'}</SelectItem>
                    <SelectItem value="replace">{isBn ? 'রিপ্লেস (সব মুছে নতুন করুন)' : 'Replace (delete all & insert)'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>{isBn ? 'CSV ফাইল' : 'CSV File'}</Label>
                <Input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                />
              </div>

              {restoreMode === 'replace' && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 rounded-lg text-sm">
                  <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                  <span className="text-destructive">
                    {isBn
                      ? 'সতর্কতা: এই মোডে টেবিলের সব ডেটা মুছে নতুন ডেটা ইনসার্ট হবে!'
                      : 'Warning: This mode will DELETE all existing data in the table and insert new data!'}
                  </span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreOpen(false)}>
                {isBn ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleRestore} disabled={restoring || !restoreFile || !restoreTable} className="gap-2">
                {restoring ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {isBn ? 'রিস্টোর করুন' : 'Restore'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
