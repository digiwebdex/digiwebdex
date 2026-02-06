import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Upload, CreditCard, Building2, Phone, FileText, Loader2 } from 'lucide-react';
import { manualPaymentService, type ManualPaymentMethod } from '@/services/manualPaymentService';

interface ManualPaymentFormProps {
  orderId?: string;
  invoiceId?: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ManualPaymentForm({ 
  orderId, 
  invoiceId, 
  amount, 
  onSuccess, 
  onCancel 
}: ManualPaymentFormProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [method, setMethod] = useState<ManualPaymentMethod>('bkash_personal');
  const [transactionId, setTransactionId] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const instructions = manualPaymentService.getPaymentInstructions();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(language === 'bn' ? 'ফাইল ৫MB এর বেশি হতে পারবে না' : 'File must be less than 5MB');
        return;
      }
      setScreenshot(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error(language === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please login first');
      return;
    }

    if (!transactionId.trim()) {
      toast.error(language === 'bn' ? 'ট্রানজেকশন আইডি প্রয়োজন' : 'Transaction ID is required');
      return;
    }

    if (method === 'bkash_personal' && !senderNumber.trim()) {
      toast.error(language === 'bn' ? 'প্রেরকের নম্বর প্রয়োজন' : 'Sender number is required');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await manualPaymentService.submitPayment(
        {
          orderId,
          invoiceId,
          method,
          transactionId: transactionId.trim(),
          senderNumber: senderNumber.trim() || undefined,
          amount,
          notes: notes.trim() || undefined,
        },
        user.id,
        user.email,
        screenshot || undefined
      );

      if (error) throw error;

      toast.success(
        language === 'bn' 
          ? 'পেমেন্ট জমা দেওয়া হয়েছে! যাচাইয়ের অপেক্ষায়' 
          : 'Payment submitted! Awaiting verification'
      );
      onSuccess?.();
    } catch (err) {
      toast.error(
        language === 'bn' 
          ? 'পেমেন্ট জমা দিতে সমস্যা হয়েছে' 
          : 'Failed to submit payment'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {language === 'bn' ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Select Payment Method'}
          </CardTitle>
          <CardDescription>
            {language === 'bn' 
              ? `পরিশোধযোগ্য পরিমাণ: ${formatCurrency(amount)}`
              : `Amount to pay: ${formatCurrency(amount)}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={method} onValueChange={(v) => setMethod(v as ManualPaymentMethod)}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Label
                htmlFor="bkash"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  method === 'bkash_personal' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="bkash_personal" id="bkash" />
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-pink-500" />
                  <span className="font-medium">bKash (Personal)</span>
                </div>
              </Label>
              
              <Label
                htmlFor="bank"
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
                  method === 'bank_transfer' ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
              >
                <RadioGroupItem value="bank_transfer" id="bank" />
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">
                    {language === 'bn' ? 'ব্যাংক ট্রান্সফার' : 'Bank Transfer'}
                  </span>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Payment Instructions */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            {language === 'bn' ? 'পেমেন্ট নির্দেশনা' : 'Payment Instructions'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {method === 'bkash_personal' ? (
            <div className="space-y-4">
              <div className="rounded-lg bg-pink-500/10 p-4">
                <p className="text-sm text-muted-foreground">
                  {language === 'bn' ? 'bKash নম্বর' : 'bKash Number'}
                </p>
                <p className="text-2xl font-bold text-pink-600">{instructions.bkash_personal.number}</p>
                <p className="text-sm text-muted-foreground">
                  ({instructions.bkash_personal.accountType})
                </p>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                {instructions.bkash_personal.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-lg bg-blue-500/10 p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'ব্যাংকের নাম' : 'Bank Name'}
                  </p>
                  <p className="font-semibold">{instructions.bank_transfer.bankName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'অ্যাকাউন্ট নাম' : 'Account Name'}
                  </p>
                  <p className="font-semibold">{instructions.bank_transfer.accountName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'bn' ? 'অ্যাকাউন্ট নম্বর' : 'Account Number'}
                  </p>
                  <p className="text-xl font-bold text-blue-600">{instructions.bank_transfer.accountNumber}</p>
                </div>
                <div className="flex gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'শাখা' : 'Branch'}
                    </p>
                    <p className="font-medium">{instructions.bank_transfer.branch}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'bn' ? 'রাউটিং নম্বর' : 'Routing Number'}
                    </p>
                    <p className="font-medium">{instructions.bank_transfer.routingNumber}</p>
                  </div>
                </div>
              </div>
              <ol className="list-inside list-decimal space-y-2 text-sm text-muted-foreground">
                {instructions.bank_transfer.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5" />
            {language === 'bn' ? 'পেমেন্ট তথ্য জমা দিন' : 'Submit Payment Details'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="transactionId">
                  {language === 'bn' ? 'ট্রানজেকশন আইডি *' : 'Transaction ID *'}
                </Label>
                <Input
                  id="transactionId"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  placeholder={language === 'bn' ? 'যেমন: TXN123456' : 'e.g., TXN123456'}
                  required
                />
              </div>

              {method === 'bkash_personal' && (
                <div className="space-y-2">
                  <Label htmlFor="senderNumber">
                    {language === 'bn' ? 'প্রেরকের নম্বর *' : 'Sender Number *'}
                  </Label>
                  <Input
                    id="senderNumber"
                    value={senderNumber}
                    onChange={(e) => setSenderNumber(e.target.value)}
                    placeholder={language === 'bn' ? 'যেমন: 01XXXXXXXXX' : 'e.g., 01XXXXXXXXX'}
                    required={method === 'bkash_personal'}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="screenshot">
                {language === 'bn' ? 'স্ক্রিনশট/রসিদ আপলোড করুন' : 'Upload Screenshot/Receipt'}
              </Label>
              <div className="flex items-center gap-4">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,application/pdf"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
                {screenshot && (
                  <span className="text-sm text-muted-foreground">
                    {screenshot.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {language === 'bn' 
                  ? 'সর্বোচ্চ ৫MB, JPG/PNG/PDF'
                  : 'Max 5MB, JPG/PNG/PDF'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">
                {language === 'bn' ? 'অতিরিক্ত তথ্য (ঐচ্ছিক)' : 'Additional Notes (Optional)'}
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={language === 'bn' ? 'কোনো অতিরিক্ত তথ্য থাকলে লিখুন' : 'Any additional information'}
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  {language === 'bn' ? 'বাতিল' : 'Cancel'}
                </Button>
              )}
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {language === 'bn' ? 'জমা দেওয়া হচ্ছে...' : 'Submitting...'}
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    {language === 'bn' ? 'পেমেন্ট জমা দিন' : 'Submit Payment'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
