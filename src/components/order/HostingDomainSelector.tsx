import React, { useState, useCallback } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Globe, 
  Search, 
  Loader2, 
  Check, 
  X, 
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { domainService, DomainSearchResult } from '@/services/domainService';

export type DomainType = 'existing' | 'new';

export interface SelectedDomain {
  type: DomainType;
  domainName: string;
  price?: number;
  renewalPrice?: number;
  tld?: string;
  isValid: boolean;
}

interface HostingDomainSelectorProps {
  selectedDomain: SelectedDomain | null;
  onDomainChange: (domain: SelectedDomain | null) => void;
}

// Domain format validation regex
const DOMAIN_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i;

export function HostingDomainSelector({ selectedDomain, onDomainChange }: HostingDomainSelectorProps) {
  const { language } = useLanguage();
  const [domainType, setDomainType] = useState<DomainType | null>(selectedDomain?.type || null);
  
  // Existing domain state
  const [existingDomain, setExistingDomain] = useState(selectedDomain?.type === 'existing' ? selectedDomain.domainName : '');
  const [existingDomainError, setExistingDomainError] = useState<string | null>(null);
  const [existingDomainValid, setExistingDomainValid] = useState(false);
  
  // New domain search state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    primary: DomainSearchResult;
    alternatives: DomainSearchResult[];
  } | null>(null);
  const [selectedNewDomain, setSelectedNewDomain] = useState<DomainSearchResult | null>(
    selectedDomain?.type === 'new' && selectedDomain.price 
      ? { 
          domain: selectedDomain.domainName, 
          tld: selectedDomain.tld || '', 
          isAvailable: true, 
          price: selectedDomain.price, 
          renewalPrice: selectedDomain.renewalPrice || 0, 
          currency: 'BDT' 
        } 
      : null
  );
  const [searchError, setSearchError] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(language === 'bn' ? 'bn-BD' : 'en-US', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Validate existing domain format
  const validateExistingDomain = useCallback((domain: string) => {
    const cleaned = domain.toLowerCase().trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '');
    
    if (!cleaned) {
      setExistingDomainError(null);
      setExistingDomainValid(false);
      onDomainChange(null);
      return;
    }
    
    if (!DOMAIN_REGEX.test(cleaned)) {
      setExistingDomainError(
        language === 'bn' 
          ? 'সঠিক ডোমেইন ফরম্যাট দিন (যেমন: example.com)' 
          : 'Enter valid domain format (e.g., example.com)'
      );
      setExistingDomainValid(false);
      onDomainChange(null);
      return;
    }
    
    setExistingDomainError(null);
    setExistingDomainValid(true);
    onDomainChange({
      type: 'existing',
      domainName: cleaned,
      isValid: true,
    });
  }, [language, onDomainChange]);

  // Handle existing domain input change
  const handleExistingDomainChange = (value: string) => {
    const cleaned = value.toLowerCase().replace(/\s/g, '');
    setExistingDomain(cleaned);
    validateExistingDomain(cleaned);
  };

  // Handle domain type change
  const handleTypeChange = (type: DomainType) => {
    setDomainType(type);
    
    if (type === 'existing') {
      setSelectedNewDomain(null);
      setSearchResults(null);
      setSearchQuery('');
      if (existingDomain) {
        validateExistingDomain(existingDomain);
      } else {
        onDomainChange(null);
      }
    } else {
      setExistingDomain('');
      setExistingDomainError(null);
      setExistingDomainValid(false);
      if (selectedNewDomain) {
        onDomainChange({
          type: 'new',
          domainName: selectedNewDomain.domain,
          price: selectedNewDomain.price,
          renewalPrice: selectedNewDomain.renewalPrice,
          tld: selectedNewDomain.tld,
          isValid: true,
        });
      } else {
        onDomainChange(null);
      }
    }
  };

  // Search for new domain
  const handleSearchDomain = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);
    
    try {
      const results = await domainService.searchDomain(searchQuery);
      setSearchResults(results);
    } catch (error) {
      setSearchError(
        language === 'bn' 
          ? 'ডোমেইন খুঁজতে সমস্যা হয়েছে' 
          : 'Failed to search domain'
      );
    } finally {
      setIsSearching(false);
    }
  };

  // Select a new domain
  const handleSelectNewDomain = (result: DomainSearchResult) => {
    if (!result.isAvailable) return;
    
    setSelectedNewDomain(result);
    onDomainChange({
      type: 'new',
      domainName: result.domain,
      price: result.price,
      renewalPrice: result.renewalPrice,
      tld: result.tld,
      isValid: true,
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b">
        <Globe className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">
          {language === 'bn' ? 'ডোমেইন তথ্য নির্বাচন করুন' : 'Select Domain Information'}
        </h3>
        <Badge variant="destructive" className="text-xs">
          {language === 'bn' ? 'আবশ্যক' : 'Required'}
        </Badge>
      </div>

      {/* Radio Options */}
      <RadioGroup 
        value={domainType || ''} 
        onValueChange={(value) => handleTypeChange(value as DomainType)}
        className="space-y-3"
      >
        {/* Option 1: Existing Domain */}
        <Card 
          className={cn(
            'cursor-pointer transition-all',
            domainType === 'existing' && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={() => handleTypeChange('existing')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="existing" id="existing" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="existing" className="font-medium cursor-pointer">
                  {language === 'bn' ? 'আমার পূর্বের ডোমেইন আছে' : 'I have an existing domain'}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'bn' 
                    ? 'অন্য প্রোভাইডার থেকে কেনা ডোমেইন ব্যবহার করুন' 
                    : 'Use a domain purchased from another provider'}
                </p>
                
                {domainType === 'existing' && (
                  <div className="mt-4 space-y-2">
                    <div className="relative">
                      <Input
                        value={existingDomain}
                        onChange={(e) => handleExistingDomainChange(e.target.value)}
                        placeholder="yourdomain.com"
                        className={cn(
                          'pr-10',
                          existingDomainError && 'border-destructive',
                          existingDomainValid && 'border-primary'
                        )}
                        autoFocus
                      />
                      {existingDomainValid && (
                        <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                      )}
                      {existingDomainError && (
                        <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
                      )}
                    </div>
                    {existingDomainError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {existingDomainError}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {language === 'bn' 
                        ? 'শুধু ডোমেইন নাম দিন, http:// বা www ছাড়া' 
                        : 'Enter domain name only, without http:// or www'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Option 2: New Domain */}
        <Card 
          className={cn(
            'cursor-pointer transition-all',
            domainType === 'new' && 'border-primary ring-2 ring-primary/20'
          )}
          onClick={() => handleTypeChange('new')}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <RadioGroupItem value="new" id="new" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="new" className="font-medium cursor-pointer">
                  {language === 'bn' ? 'নতুন ডোমেইন কিনবো' : 'I want to buy a new domain'}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'bn' 
                    ? 'DigiWebDex থেকে নতুন ডোমেইন রেজিস্ট্রেশন করুন' 
                    : 'Register a new domain with DigiWebDex'}
                </p>
                
                {domainType === 'new' && (
                  <div className="mt-4 space-y-4">
                    {/* Search Input */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value.toLowerCase().replace(/\s/g, ''))}
                          placeholder={language === 'bn' ? 'ডোমেইন নাম খুঁজুন...' : 'Search domain name...'}
                          className="pl-9"
                          onKeyDown={(e) => e.key === 'Enter' && handleSearchDomain()}
                          autoFocus
                        />
                      </div>
                      <Button 
                        onClick={handleSearchDomain}
                        disabled={!searchQuery.trim() || isSearching}
                      >
                        {isSearching ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          language === 'bn' ? 'খুঁজুন' : 'Search'
                        )}
                      </Button>
                    </div>

                    {searchError && (
                      <p className="text-sm text-destructive">{searchError}</p>
                    )}

                    {/* Search Results */}
                    {searchResults && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        <div
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border transition-all',
                            searchResults.primary.isAvailable 
                              ? 'cursor-pointer hover:border-primary' 
                              : 'opacity-60 cursor-not-allowed',
                            selectedNewDomain?.domain === searchResults.primary.domain && 'border-primary bg-primary/5'
                          )}
                          onClick={() => handleSelectNewDomain(searchResults.primary)}
                        >
                          <div className="flex items-center gap-2">
                            {searchResults.primary.isAvailable ? (
                              <Check className="h-4 w-4 text-primary" />
                            ) : (
                              <X className="h-4 w-4 text-destructive" />
                            )}
                            <span className="font-medium">{searchResults.primary.domain}</span>
                            {searchResults.primary.isPremium && (
                              <Badge variant="secondary" className="text-xs">Premium</Badge>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-primary">
                              {formatCurrency(searchResults.primary.price)}
                            </span>
                            {searchResults.primary.isAvailable && (
                              <span className="text-xs text-muted-foreground block">
                                {language === 'bn' ? '/বছর' : '/year'}
                              </span>
                            )}
                          </div>
                        </div>

                        {searchResults.alternatives.filter(a => a.isAvailable).slice(0, 3).map((alt) => (
                          <div
                            key={alt.domain}
                            className={cn(
                              'flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer hover:border-primary',
                              selectedNewDomain?.domain === alt.domain && 'border-primary bg-primary/5'
                            )}
                            onClick={() => handleSelectNewDomain(alt)}
                          >
                            <div className="flex items-center gap-2">
                              <Check className="h-4 w-4 text-primary" />
                              <span className="font-medium">{alt.domain}</span>
                            </div>
                            <span className="font-bold text-primary">
                              {formatCurrency(alt.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Selected Domain Display */}
                    {selectedNewDomain && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                        <ShoppingCart className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">
                          {selectedNewDomain.domain}
                        </span>
                        <Badge className="ml-auto">
                          {formatCurrency(selectedNewDomain.price)}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </RadioGroup>

      {/* Error if no domain selected when type is chosen */}
      {domainType && !selectedDomain?.isValid && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <span className="text-sm text-destructive">
            {language === 'bn' 
              ? 'হোস্টিং অর্ডারের জন্য ডোমেইন আবশ্যক।' 
              : 'Domain is required for hosting order.'}
          </span>
        </div>
      )}
    </div>
  );
}

export default HostingDomainSelector;
