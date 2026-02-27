import React, { useEffect, useState } from 'react';
import { ExportToolbar } from '@/components/admin/common/ExportToolbar';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Phone,
  Building2,
  Eye,
  Check,
  X,
  Search,
  ImageIcon,
  Loader2,
  User,
} from 'lucide-react';
import { manualPaymentService, type ManualPayment, type ManualPaymentStatus } from '@/services/manualPaymentService';

interface PaymentWithUser extends ManualPayment {
  user_email?: string;
  user_name?: string;
}

export default function AdminPaymentVerification() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ManualPaymentStatus | 'all'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [selectedPayment, setSelectedPayment] = useState<PaymentWithUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, [activeTab]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const data = await manualPaymentService.getAllPayments(status);
      
      // Fetch user details for each payment
      const paymentsWithUsers: PaymentWithUser[] = await Promise.all(
        data.map(async (payment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', payment.user_id)
            .single();
          
          return {
            ...payment,
            user_name: profile?.full_name || 'Unknown',
          };
        })
      );

      setPayments(paymentsWithUsers);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error(language === 'bn' ? 'পেমেন্ট লোড করতে সমস্যা' : 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (payment: PaymentWithUser) => {
    setSelectedPayment(payment);
    setShowDetailsModal(true);
    
    // Get signed URL for screenshot if exists
    if (payment.screenshot_url) {
      const signedUrl = await manualPaymentService.getSignedScreenshotUrl(payment.screenshot_url);
      setScreenshotUrl(signedUrl);
    } else {
      setScreenshotUrl(null);
    }
  };

  const handleApprove = async (payment: PaymentWithUser) => {
    if (!user) return;
    
    setProcessing(true);
    try {
      const { error } = await manualPaymentService.approvePayment(payment.id, user.id);
      if (error) throw error;
      
      toast.success(language === 'bn' ? 'পেমেন্ট অনুমোদিত হয়েছে' : 'Payment approved');
      setShowDetailsModal(false);
      fetchPayments();
    } catch (err) {
      toast.error(language === 'bn' ? 'অনুমোদন করতে সমস্যা হয়েছে' : 'Failed to approve payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!user || !selectedPayment || !rejectionReason.trim()) {
      toast.error(language === 'bn' ? 'প্রত্যাখ্যানের কারণ লিখুন' : 'Please provide a rejection reason');
      return;
    }
    
    setProcessing(true);
    try {
      const { error } = await manualPaymentService.rejectPayment(
        selectedPayment.id, 
        user.id, 
        rejectionReason.trim()
      );
      if (error) throw error;
      
      toast.success(language === 'bn' ? 'পেমেন্ট প্রত্যাখ্যাত হয়েছে' : 'Payment rejected');
      setShowRejectModal(false);
      setShowDetailsModal(false);
      setRejectionReason('');
      fetchPayments();
    } catch (err) {
      toast.error(language === 'bn' ? 'প্রত্যাখ্যান করতে সমস্যা হয়েছে' : 'Failed to reject payment');
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-600">
            <Clock className="h-3 w-3" />
            {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="gap-1 border-green-500 text-green-600">
            <CheckCircle2 className="h-3 w-3" />
            {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="gap-1 border-destructive text-destructive">
            <XCircle className="h-3 w-3" />
            {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getMethodIcon = (method: string) => {
    if (method === 'bkash_personal') {
      return <Phone className="h-4 w-4 text-pink-500" />;
    }
    return <Building2 className="h-4 w-4 text-blue-500" />;
  };

  const getMethodLabel = (method: string) => {
    if (method === 'bkash_personal') {
      return 'bKash';
    }
    return language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer';
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      payment.transaction_id.toLowerCase().includes(query) ||
      payment.sender_number?.toLowerCase().includes(query) ||
      payment.user_name?.toLowerCase().includes(query)
    );
  });

  const pendingCount = payments.filter(p => p.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            {language === 'bn' ? 'পেমেন্ট যাচাই' : 'Payment Verification'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'bn' 
              ? 'ম্যানুয়াল পেমেন্ট যাচাই এবং অনুমোদন করুন'
              : 'Verify and approve manual payments'
            }
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {language === 'bn' ? 'পেমেন্ট তালিকা' : 'Payment List'}
                  {pendingCount > 0 && (
                    <Badge variant="destructive">{pendingCount} {language === 'bn' ? 'অপেক্ষমাণ' : 'pending'}</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {language === 'bn' ? 'সকল ম্যানুয়াল পেমেন্ট জমা' : 'All manual payment submissions'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <ExportToolbar
                  data={filteredPayments.map(p => ({ transaction_id: p.transaction_id, method: p.method, amount: String(p.amount), sender: p.sender_number || '', customer: p.user_name || '', status: p.status, date: format(new Date(p.created_at), 'dd MMM yyyy') } as Record<string, unknown>))}
                  columns={[{ key: 'transaction_id', header: 'Transaction' }, { key: 'method', header: 'Method' }, { key: 'amount', header: 'Amount' }, { key: 'sender', header: 'Sender' }, { key: 'customer', header: 'Customer' }, { key: 'status', header: 'Status' }, { key: 'date', header: 'Date' }]}
                  filename="payments"
                  title={language === 'bn' ? 'পেমেন্ট তালিকা' : 'Payments List'}
                />
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={language === 'bn' ? 'অনুসন্ধান করুন...' : 'Search...'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ManualPaymentStatus | 'all')}>
              <TabsList className="mb-4">
                <TabsTrigger value="pending">
                  {language === 'bn' ? 'অপেক্ষমাণ' : 'Pending'}
                </TabsTrigger>
                <TabsTrigger value="approved">
                  {language === 'bn' ? 'অনুমোদিত' : 'Approved'}
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  {language === 'bn' ? 'প্রত্যাখ্যাত' : 'Rejected'}
                </TabsTrigger>
                <TabsTrigger value="all">
                  {language === 'bn' ? 'সব' : 'All'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-0">
                {loading ? (
                  <div className="py-12 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredPayments.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground">
                    {language === 'bn' ? 'কোনো পেমেন্ট পাওয়া যায়নি' : 'No payments found'}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>{language === 'bn' ? 'তারিখ' : 'Date'}</TableHead>
                          <TableHead>{language === 'bn' ? 'ব্যবহারকারী' : 'User'}</TableHead>
                          <TableHead>{language === 'bn' ? 'পদ্ধতি' : 'Method'}</TableHead>
                          <TableHead>{language === 'bn' ? 'ট্রানজেকশন' : 'Transaction'}</TableHead>
                          <TableHead className="text-right">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</TableHead>
                          <TableHead>{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</TableHead>
                          <TableHead className="text-right">{language === 'bn' ? 'কার্যক্রম' : 'Actions'}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm')}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">{payment.user_name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getMethodIcon(payment.method)}
                                <span>{getMethodLabel(payment.method)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <p className="font-mono text-sm">{payment.transaction_id}</p>
                                {payment.sender_number && (
                                  <p className="text-xs text-muted-foreground">{payment.sender_number}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatCurrency(payment.amount)}
                            </TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleViewDetails(payment)}
                                  title={language === 'bn' ? 'বিস্তারিত' : 'Details'}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {payment.status === 'pending' && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-green-600 hover:bg-green-100 hover:text-green-700"
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        handleApprove(payment);
                                      }}
                                      title={language === 'bn' ? 'অনুমোদন' : 'Approve'}
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive hover:bg-destructive/10"
                                      onClick={() => {
                                        setSelectedPayment(payment);
                                        setShowRejectModal(true);
                                      }}
                                      title={language === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'পেমেন্ট বিস্তারিত' : 'Payment Details'}</DialogTitle>
            <DialogDescription>
              {selectedPayment && format(new Date(selectedPayment.created_at), 'dd MMM yyyy HH:mm:ss')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ব্যবহারকারী' : 'User'}</Label>
                  <p className="font-medium">{selectedPayment.user_name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'পদ্ধতি' : 'Method'}</Label>
                  <div className="flex items-center gap-2">
                    {getMethodIcon(selectedPayment.method)}
                    <span className="font-medium">{getMethodLabel(selectedPayment.method)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'ট্রানজেকশন আইডি' : 'Transaction ID'}</Label>
                  <p className="font-mono font-medium">{selectedPayment.transaction_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'পরিমাণ' : 'Amount'}</Label>
                  <p className="text-xl font-bold text-primary">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                {selectedPayment.sender_number && (
                  <div>
                    <Label className="text-muted-foreground">{language === 'bn' ? 'প্রেরকের নম্বর' : 'Sender Number'}</Label>
                    <p className="font-medium">{selectedPayment.sender_number}</p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'স্ট্যাটাস' : 'Status'}</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>

              {selectedPayment.notes && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'নোট' : 'Notes'}</Label>
                  <p className="mt-1 rounded bg-muted p-2 text-sm">{selectedPayment.notes}</p>
                </div>
              )}

              {screenshotUrl && (
                <div>
                  <Label className="text-muted-foreground">{language === 'bn' ? 'স্ক্রিনশট' : 'Screenshot'}</Label>
                  <div className="mt-2 overflow-hidden rounded-lg border">
                    <img 
                      src={screenshotUrl} 
                      alt="Payment proof" 
                      className="max-h-64 w-full object-contain"
                    />
                  </div>
                </div>
              )}

              {selectedPayment.rejection_reason && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                  <Label className="text-destructive">{language === 'bn' ? 'প্রত্যাখ্যানের কারণ' : 'Rejection Reason'}</Label>
                  <p className="mt-1 text-sm">{selectedPayment.rejection_reason}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedPayment?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(true)}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="mr-2 h-4 w-4" />
                  {language === 'bn' ? 'প্রত্যাখ্যান' : 'Reject'}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedPayment)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  {language === 'bn' ? 'অনুমোদন করুন' : 'Approve'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'bn' ? 'পেমেন্ট প্রত্যাখ্যান' : 'Reject Payment'}</DialogTitle>
            <DialogDescription>
              {language === 'bn' 
                ? 'প্রত্যাখ্যানের কারণ লিখুন। ব্যবহারকারী এই কারণ দেখতে পাবেন।'
                : 'Provide a reason for rejection. The user will see this reason.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="reason">{language === 'bn' ? 'কারণ *' : 'Reason *'}</Label>
              <Textarea
                id="reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'bn' ? 'প্রত্যাখ্যানের কারণ লিখুন...' : 'Enter rejection reason...'}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectModal(false)}>
              {language === 'bn' ? 'বাতিল' : 'Cancel'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <X className="mr-2 h-4 w-4" />
              )}
              {language === 'bn' ? 'প্রত্যাখ্যান করুন' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
