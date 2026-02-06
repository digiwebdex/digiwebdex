import React, { useEffect, useState } from 'react';
import { Loader2, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLanguage } from '@/lib/i18n';
import { domainService, type DomainPricing } from '@/services/domainService';

export function DomainPricingTable() {
  const { language } = useLanguage();
  const [pricing, setPricing] = useState<DomainPricing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPricing();
  }, []);

  const loadPricing = async () => {
    try {
      const data = await domainService.getAllTlds();
      setPricing(data);
    } catch (error) {
      console.error('Error loading domain pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string, marginPercent: number) => {
    const finalPrice = Math.ceil(price * (1 + marginPercent / 100));
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(finalPrice);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {language === 'bn' ? 'ডোমেইন মূল্য তালিকা' : 'Domain Pricing'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{language === 'bn' ? 'এক্সটেনশন' : 'Extension'}</TableHead>
                <TableHead className="text-right">{language === 'bn' ? 'রেজিস্ট্রেশন' : 'Registration'}</TableHead>
                <TableHead className="text-right">{language === 'bn' ? 'রিনিউয়াল' : 'Renewal'}</TableHead>
                <TableHead className="text-right">{language === 'bn' ? 'ট্রান্সফার' : 'Transfer'}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pricing.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium">{item.tld}</span>
                      {item.is_popular && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-2 w-2 mr-1 fill-current" />
                          {language === 'bn' ? 'জনপ্রিয়' : 'Popular'}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(item.base_price, item.currency, item.margin_percent)}
                    <span className="text-xs text-muted-foreground">/{language === 'bn' ? 'বছর' : 'yr'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.renewal_price, item.currency, item.margin_percent)}
                    <span className="text-xs text-muted-foreground">/{language === 'bn' ? 'বছর' : 'yr'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.transfer_price, item.currency, item.margin_percent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="text-xs text-muted-foreground mt-4">
          {language === 'bn' 
            ? '* সকল মূল্য বাংলাদেশী টাকায় এবং ভ্যাট সহ। প্রিমিয়াম ডোমেইনের মূল্য ভিন্ন হতে পারে।'
            : '* All prices are in BDT including VAT. Premium domains may have different pricing.'}
        </p>
      </CardContent>
    </Card>
  );
}
