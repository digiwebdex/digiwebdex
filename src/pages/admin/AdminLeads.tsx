import React, { useState, useEffect } from 'react';
import { ExportToolbar } from '@/components/admin/common/ExportToolbar';
import { useLanguage } from '@/lib/i18n';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, UserPlus, UserCheck, UserX, Phone, Mail, 
  Search, RefreshCw, MessageSquare, ShoppingCart,
  TrendingUp, Clock, Calendar, Filter, MoreVertical
} from 'lucide-react';
import { leadService, Lead, LeadStatus } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusConfig: Record<LeadStatus, { label: string; labelBn: string; color: string }> = {
  new: { label: 'New', labelBn: 'নতুন', color: 'bg-blue-500' },
  contacted: { label: 'Contacted', labelBn: 'যোগাযোগ হয়েছে', color: 'bg-yellow-500' },
  converted: { label: 'Converted', labelBn: 'কনভার্ট হয়েছে', color: 'bg-emerald-500' },
  lost: { label: 'Lost', labelBn: 'হারিয়ে গেছে', color: 'bg-red-500' },
};

const serviceLabels: Record<string, { en: string; bn: string }> = {
  'domain-hosting': { en: 'Domain & Hosting', bn: 'ডোমেইন ও হোস্টিং' },
  'web-development': { en: 'Web Development', bn: 'ওয়েব ডেভেলপমেন্ট' },
  'software': { en: 'Software', bn: 'সফটওয়্যার' },
  'digital-marketing': { en: 'Digital Marketing', bn: 'ডিজিটাল মার্কেটিং' },
  'other': { en: 'Other', bn: 'অন্যান্য' },
};

export default function AdminLeads() {
  const { language } = useLanguage();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({ total: 0, new: 0, contacted: 0, converted: 0, lost: 0, conversionRate: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [leadsResult, statsResult] = await Promise.all([
        leadService.getLeads({
          status: statusFilter === 'all' ? undefined : statusFilter,
          search: searchQuery || undefined,
          limit: 100,
        }),
        leadService.getLeadStats(),
      ]);

      setLeads(leadsResult.data);
      setStats(statsResult);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: language === 'bn' ? 'লিড লোড করতে সমস্যা হয়েছে' : 'Failed to load leads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const handleSearch = () => {
    fetchData();
  };

  const handleStatusChange = async () => {
    if (!selectedLead) return;
    setUpdating(true);

    try {
      const result = await leadService.updateLeadStatus(selectedLead.id, newStatus, notes);
      if (result.success) {
        toast({
          title: language === 'bn' ? 'সফল' : 'Success',
          description: language === 'bn' ? 'স্ট্যাটাস আপডেট হয়েছে' : 'Status updated successfully',
        });
        setIsStatusModalOpen(false);
        fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: language === 'bn' ? 'ত্রুটি' : 'Error',
        description: error instanceof Error ? error.message : 'Failed to update',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleConvertToOrder = (lead: Lead) => {
    // Navigate to order creation with lead data
    window.location.href = `/admin/orders/create?lead_id=${lead.id}&name=${encodeURIComponent(lead.name)}&phone=${encodeURIComponent(lead.phone)}`;
  };

  const openStatusModal = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setNotes(lead.notes || '');
    setIsStatusModalOpen(true);
  };

  const statCards = [
    { icon: Users, label: language === 'bn' ? 'মোট লিড' : 'Total Leads', value: stats.total, color: 'text-primary' },
    { icon: UserPlus, label: language === 'bn' ? 'নতুন' : 'New', value: stats.new, color: 'text-blue-500' },
    { icon: Phone, label: language === 'bn' ? 'যোগাযোগ হয়েছে' : 'Contacted', value: stats.contacted, color: 'text-yellow-500' },
    { icon: UserCheck, label: language === 'bn' ? 'কনভার্ট' : 'Converted', value: stats.converted, color: 'text-emerald-500' },
    { icon: TrendingUp, label: language === 'bn' ? 'কনভার্সন রেট' : 'Conversion Rate', value: `${stats.conversionRate}%`, color: 'text-violet-500' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">
              {language === 'bn' ? 'লিড ম্যানেজমেন্ট' : 'Lead Management'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'bn' ? 'সকল লিড দেখুন এবং ম্যানেজ করুন' : 'View and manage all leads'}
            </p>
          </div>
          <div className="flex gap-2">
            <ExportToolbar
              data={leads.map(l => ({ name: l.name, phone: l.phone, email: l.email || '', service: l.service_interest || '', status: l.status, source: l.source || '', created: l.created_at ? format(new Date(l.created_at), 'dd MMM yyyy') : '' } as Record<string, unknown>))}
              columns={[{ key: 'name', header: 'Name' }, { key: 'phone', header: 'Phone' }, { key: 'email', header: 'Email' }, { key: 'service', header: 'Service' }, { key: 'status', header: 'Status' }, { key: 'source', header: 'Source' }, { key: 'created', header: 'Date' }]}
              filename="leads"
              title={language === 'bn' ? 'লিড তালিকা' : 'Leads List'}
            />
            <Button onClick={fetchData} variant="outline" className="gap-2">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {language === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'bn' ? 'নাম, ফোন বা ইমেইল দিয়ে খুঁজুন...' : 'Search by name, phone or email...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all')}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder={language === 'bn' ? 'স্ট্যাটাস ফিল্টার' : 'Filter Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'bn' ? 'সব' : 'All'}</SelectItem>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'bn' ? config.labelBn : config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} className="gap-2">
                <Search className="w-4 h-4" />
                {language === 'bn' ? 'খুঁজুন' : 'Search'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {language === 'bn' ? 'লিড তালিকা' : 'Leads List'}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({leads.length})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{language === 'bn' ? 'নাম' : 'Name'}</TableHead>
                    <TableHead>{language === 'bn' ? 'ফোন' : 'Phone'}</TableHead>
                    <TableHead>{language === 'bn' ? 'সার্ভিস' : 'Service'}</TableHead>
                    <TableHead>{language === 'bn' ? 'সোর্স' : 'Source'}</TableHead>
                    <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                    <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                    <TableHead className="text-right">{language === 'bn' ? 'অ্যাকশন' : 'Actions'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <RefreshCw className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : leads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                        {language === 'bn' ? 'কোনো লিড পাওয়া যায়নি' : 'No leads found'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{lead.name}</p>
                            {lead.email && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Mail className="w-3 h-3" /> {lead.email}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-primary hover:underline">
                            <Phone className="w-3 h-3" /> {lead.phone}
                          </a>
                        </TableCell>
                        <TableCell>
                          {lead.service_interest && (
                            <Badge variant="secondary">
                              {serviceLabels[lead.service_interest]?.[language === 'bn' ? 'bn' : 'en'] || lead.service_interest}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">{lead.source.replace(/_/g, ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig[lead.status].color} text-white`}>
                            {language === 'bn' ? statusConfig[lead.status].labelBn : statusConfig[lead.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(lead.created_at), 'dd MMM yyyy')}
                          </div>
                          {lead.follow_up_count > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <Clock className="w-3 h-3" />
                              {language === 'bn' ? `${lead.follow_up_count}টি ফলো-আপ` : `${lead.follow_up_count} follow-ups`}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openStatusModal(lead)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'স্ট্যাটাস পরিবর্তন' : 'Change Status'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                                <Phone className="w-4 h-4 mr-2" />
                                {language === 'bn' ? 'কল করুন' : 'Call'}
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`https://wa.me/${lead.phone.replace(/^0/, '88')}`)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                WhatsApp
                              </DropdownMenuItem>
                              {lead.status !== 'converted' && (
                                <DropdownMenuItem onClick={() => handleConvertToOrder(lead)}>
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  {language === 'bn' ? 'অর্ডারে কনভার্ট' : 'Convert to Order'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Status Change Modal */}
        <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === 'bn' ? 'লিড স্ট্যাটাস পরিবর্তন' : 'Change Lead Status'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>{language === 'bn' ? 'লিড' : 'Lead'}</Label>
                <p className="text-sm text-muted-foreground">{selectedLead?.name} - {selectedLead?.phone}</p>
              </div>
              <div>
                <Label>{language === 'bn' ? 'নতুন স্ট্যাটাস' : 'New Status'}</Label>
                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as LeadStatus)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([key, config]) => (
                      <SelectItem key={key} value={key}>
                        {language === 'bn' ? config.labelBn : config.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                <Textarea
                  placeholder={language === 'bn' ? 'নোট লিখুন...' : 'Add notes...'}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsStatusModalOpen(false)}>
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </Button>
              <Button onClick={handleStatusChange} disabled={updating}>
                {updating ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                {language === 'bn' ? 'সংরক্ষণ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
