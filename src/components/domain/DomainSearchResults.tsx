import React from 'react';
import { Check, X, Crown, ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';
import type { DomainSearchResult } from '@/services/domainService';

interface DomainSearchResultsProps {
  primary: DomainSearchResult;
  alternatives: DomainSearchResult[];
  onAddToCart: (result: DomainSearchResult) => void;
}

export function DomainSearchResults({
  primary,
  alternatives,
  onAddToCart,
}: DomainSearchResultsProps) {
  const { language } = useLanguage();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-BD', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Primary Result */}
      <Card className={`border-2 ${primary.isAvailable ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500 bg-red-50/50 dark:bg-red-950/20'}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${primary.isAvailable ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                {primary.isAvailable ? (
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <X className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-bold">{primary.domain}</h3>
                  {primary.isPremium && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                      <Crown className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className={`text-sm ${primary.isAvailable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {primary.isAvailable
                    ? (language === 'bn' ? 'এই ডোমেইনটি পাওয়া যাচ্ছে!' : 'This domain is available!')
                    : (language === 'bn' ? 'এই ডোমেইনটি নেওয়া হয়ে গেছে' : 'This domain is taken')}
                </p>
              </div>
            </div>
            
            {primary.isAvailable && (
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-2xl font-bold text-primary">
                    {formatPrice(primary.price, primary.currency)}
                    <span className="text-sm font-normal text-muted-foreground">
                      /{language === 'bn' ? 'বছর' : 'year'}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'bn' ? 'রিনিউয়াল:' : 'Renewal:'} {formatPrice(primary.renewalPrice, primary.currency)}/{language === 'bn' ? 'বছর' : 'yr'}
                  </p>
                </div>
                <Button onClick={() => onAddToCart(primary)} size="lg">
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {language === 'bn' ? 'অর্ডার করুন' : 'Order Now'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative Results */}
      {alternatives.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold mb-4">
            {language === 'bn' ? 'অন্যান্য বিকল্প' : 'Other Options'}
          </h4>
          <div className="grid gap-3">
            {alternatives.map((result) => (
              <Card key={result.domain} className={`${result.isAvailable ? '' : 'opacity-60'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded-full ${result.isAvailable ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        {result.isAvailable ? (
                          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <span className="font-medium">{result.domain}</span>
                        {result.isPremium && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            <Crown className="h-2 w-2 mr-1" />
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {formatPrice(result.price, result.currency)}
                        <span className="text-xs text-muted-foreground">
                          /{language === 'bn' ? 'বছর' : 'yr'}
                        </span>
                      </span>
                      {result.isAvailable && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => onAddToCart(result)}
                        >
                          <ShoppingCart className="h-3 w-3 mr-1" />
                          {language === 'bn' ? 'যোগ করুন' : 'Add'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
