export interface ExportColumn {
  key: string;
  header: string;
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  const headers = columns.map((c) => `"${c.header}"`).join(',');
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const val = row[col.key];
        const str = val === null || val === undefined ? '' : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      })
      .join(',')
  );
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Build a styled HTML table for print/PDF
 */
function buildPrintHTML<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  title: string
): string {
  const rows = data
    .map(
      (row) =>
        `<tr>${columns
          .map((col) => `<td>${row[col.key] ?? ''}</td>`)
          .join('')}</tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; padding: 20px; color: #222; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .meta { font-size: 12px; color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 8px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }
  tr:nth-child(even) { background: #fafafa; }
  @media print { body { padding: 0; } }
</style></head><body>
<h1>${title}</h1>
<div class="meta">Generated: ${new Date().toLocaleString()} • Total: ${data.length} records</div>
<table><thead><tr>${columns.map((c) => `<th>${c.header}</th>`).join('')}</tr></thead>
<tbody>${rows}</tbody></table>
</body></html>`;
}

/**
 * Open print dialog with formatted table
 */
export function printTable<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  title: string
): void {
  const html = buildPrintHTML(data, columns, title);
  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      win.print();
    };
  }
}

/**
 * Export to PDF using browser print-to-PDF
 */
export function exportToPDF<T extends Record<string, unknown>>(
  data: T[],
  columns: ExportColumn[],
  title: string
): void {
  // Uses same print mechanism - user selects "Save as PDF" in print dialog
  printTable(data, columns, title);
}
