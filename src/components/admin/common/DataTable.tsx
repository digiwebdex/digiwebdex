import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n';
import { ExportToolbar } from './ExportToolbar';
import type { ExportColumn } from '@/lib/exportUtils';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
  exportValue?: (row: T) => string;
}

export interface FilterOption {
  value: string;
  label: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  searchKeys?: string[];
  onRowClick?: (row: T) => void;
  selectable?: boolean;
  selectedRows?: T[];
  onSelectionChange?: (rows: T[]) => void;
  loading?: boolean;
  emptyMessage?: string;
  pageSize?: number;
  getRowId?: (row: T) => string;
  // Filter support
  filterKey?: string;
  filterOptions?: FilterOption[];
  filterLabel?: string;
  // Export support
  exportFilename?: string;
  exportTitle?: string;
  // Bulk actions
  onBulkDelete?: (rows: T[]) => void;
  onBulkStatusChange?: (rows: T[], status: string) => void;
  bulkStatusOptions?: FilterOption[];
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  searchPlaceholder,
  searchKeys = [],
  onRowClick,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  loading = false,
  emptyMessage,
  pageSize = 10,
  getRowId = (row) => String(row.id),
  filterKey,
  filterOptions,
  filterLabel,
  exportFilename,
  exportTitle,
  onBulkDelete,
  onBulkStatusChange,
  bulkStatusOptions,
}: DataTableProps<T>) {
  const { language } = useLanguage();
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filterValue, setFilterValue] = useState<string>('all');
  const [bulkStatus, setBulkStatus] = useState<string>('');

  // Filter data based on status filter
  const statusFilteredData = useMemo(() => {
    if (!filterKey || !filterValue || filterValue === 'all') return data;
    return data.filter((row) => String(row[filterKey]) === filterValue);
  }, [data, filterKey, filterValue]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!search) return statusFilteredData;
    const searchLower = search.toLowerCase();
    return statusFilteredData.filter((row) =>
      searchKeys.some((key) => {
        const value = row[key];
        return value && String(value).toLowerCase().includes(searchLower);
      })
    );
  }, [statusFilteredData, search, searchKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (onSelectionChange) {
      onSelectionChange(checked ? paginatedData : []);
    }
  };

  const handleSelectRow = (row: T, checked: boolean) => {
    if (onSelectionChange) {
      if (checked) {
        onSelectionChange([...selectedRows, row]);
      } else {
        onSelectionChange(selectedRows.filter((r) => getRowId(r) !== getRowId(row)));
      }
    }
  };

  const isRowSelected = (row: T) => selectedRows.some((r) => getRowId(r) === getRowId(row));
  const isAllSelected = paginatedData.length > 0 && paginatedData.every(isRowSelected);

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return <ChevronsUpDown className="h-4 w-4 ml-1" />;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />;
  };

  // Build export columns
  const exportColumns: ExportColumn[] = columns
    .filter((c) => c.key !== 'actions')
    .map((c) => ({ key: c.key, header: c.header }));

  // Build export data with plain text values
  const exportData = sortedData.map((row) => {
    const exportRow: Record<string, unknown> = {};
    columns.forEach((col) => {
      if (col.key !== 'actions') {
        exportRow[col.key] = col.exportValue ? col.exportValue(row) : (row[col.key] ?? '');
      }
    });
    return exportRow;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar: Search + Filter + Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          {searchKeys.length > 0 && (
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder || (language === 'bn' ? 'খুঁজুন...' : 'Search...')}
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 w-[220px]"
              />
            </div>
          )}

          {filterKey && filterOptions && (
            <Select value={filterValue} onValueChange={(v) => { setFilterValue(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={filterLabel || (language === 'bn' ? 'ফিল্টার' : 'Filter')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                {filterOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {exportFilename && (
          <ExportToolbar
            data={exportData}
            columns={exportColumns}
            filename={exportFilename}
            title={exportTitle}
          />
        )}
      </div>

      {/* Bulk action bar */}
      {selectable && selectedRows.length > 0 && (
        <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
          <span className="text-sm font-medium">
            {selectedRows.length} {language === 'bn' ? 'টি নির্বাচিত' : 'selected'}
          </span>
          {onBulkDelete && (
            <Button variant="destructive" size="sm" onClick={() => onBulkDelete(selectedRows)}>
              <Trash2 className="h-4 w-4 mr-1" />
              {language === 'bn' ? 'মুছুন' : 'Delete'}
            </Button>
          )}
          {onBulkStatusChange && bulkStatusOptions && (
            <div className="flex items-center gap-2">
              <Select value={bulkStatus} onValueChange={setBulkStatus}>
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  {bulkStatusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button size="sm" disabled={!bulkStatus} onClick={() => { onBulkStatusChange(selectedRows, bulkStatus); setBulkStatus(''); }}>
                {language === 'bn' ? 'প্রয়োগ' : 'Apply'}
              </Button>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={() => onSelectionChange?.([])}>
            {language === 'bn' ? 'বাতিল' : 'Clear'}
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  className={cn(
                    column.sortable && 'cursor-pointer select-none',
                    column.className
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center">
                    {column.header}
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (selectable ? 1 : 0)} className="text-center py-8 text-muted-foreground">
                  {emptyMessage || (language === 'bn' ? 'কোনো ডাটা নেই' : 'No data found')}
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row) => (
                <TableRow
                  key={getRowId(row)}
                  className={cn(onRowClick && 'cursor-pointer hover:bg-muted/50')}
                  onClick={() => onRowClick?.(row)}
                >
                  {selectable && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isRowSelected(row)}
                        onCheckedChange={(checked) => handleSelectRow(row, !!checked)}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => (
                    <TableCell key={column.key} className={column.className}>
                      {column.render 
                        ? column.render(row) 
                        : String(row[column.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {language === 'bn' 
              ? `${sortedData.length}টির মধ্যে ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedData.length)} দেখাচ্ছে`
              : `Showing ${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedData.length)} of ${sortedData.length}`}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
