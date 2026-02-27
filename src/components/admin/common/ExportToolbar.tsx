import React from 'react';
import { Button } from '@/components/ui/button';
import { Printer, FileDown, FileSpreadsheet } from 'lucide-react';
import { exportToCSV, printTable, ExportColumn } from '@/lib/exportUtils';
import { useLanguage } from '@/lib/i18n';

interface ExportToolbarProps<T extends Record<string, unknown>> {
  data: T[];
  columns: ExportColumn[];
  filename: string;
  title?: string;
}

export function ExportToolbar<T extends Record<string, unknown>>({
  data,
  columns,
  filename,
  title,
}: ExportToolbarProps<T>) {
  const { language } = useLanguage();
  const printTitle = title || filename;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => printTable(data, columns, printTitle)}
      >
        <Printer className="h-4 w-4 mr-1" />
        {language === 'bn' ? 'প্রিন্ট' : 'Print'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => printTable(data, columns, printTitle)}
      >
        <FileDown className="h-4 w-4 mr-1" />
        PDF
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => exportToCSV(data, columns, filename)}
      >
        <FileSpreadsheet className="h-4 w-4 mr-1" />
        CSV
      </Button>
    </div>
  );
}
