import React, { useState } from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DomainSearchInput } from './DomainSearchInput';
import { DomainSearchResults } from './DomainSearchResults';
import { DomainPricingTable } from './DomainPricingTable';
import { domainService, type DomainSearchResult } from '@/services/domainService';

interface DomainSearchProps {
  showPricingTable?: boolean;
  onOrderDomain?: (result: DomainSearchResult) => void;
}

export function DomainSearch({ showPricingTable = true, onOrderDomain }: DomainSearchProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    primary: DomainSearchResult;
    alternatives: DomainSearchResult[];
  } | null>(null);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      const results = await domainService.searchDomain(query, user?.id);
      setSearchResults(results);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Search failed';
      setSearchError(message);
      toast.error(language === 'bn' ? 'অনুসন্ধানে সমস্যা হয়েছে' : 'Search failed', {
        description: message,
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = (result: DomainSearchResult) => {
    if (onOrderDomain) {
      onOrderDomain(result);
      return;
    }

    // Default behavior: navigate to order page with domain info
    if (!user) {
      toast.info(
        language === 'bn' ? 'অনুগ্রহ করে লগইন করুন' : 'Please login first',
        { description: language === 'bn' ? 'ডোমেইন অর্ডার করতে লগইন করুন' : 'Login to order this domain' }
      );
      navigate(`/${language}/auth/login`);
      return;
    }

    // Store domain in session and redirect to order page
    sessionStorage.setItem('pendingDomainOrder', JSON.stringify(result));
    toast.success(
      language === 'bn' ? 'ডোমেইন নির্বাচিত হয়েছে' : 'Domain selected',
      { description: result.domain }
    );
    navigate(`/${language}/dashboard/orders/new?type=domain`);
  };

  return (
    <div className="space-y-8">
      {/* Search Section */}
      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            {language === 'bn' ? 'ডোমেইন খুঁজুন' : 'Find Your Domain'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <DomainSearchInput 
            onSearch={handleSearch} 
            isLoading={isSearching}
            size="lg"
          />

          {searchError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{searchError}</AlertDescription>
            </Alert>
          )}

          {searchResults && (
            <DomainSearchResults
              primary={searchResults.primary}
              alternatives={searchResults.alternatives}
              onAddToCart={handleAddToCart}
            />
          )}
        </CardContent>
      </Card>

      {/* Pricing Table */}
      {showPricingTable && !searchResults && (
        <DomainPricingTable />
      )}
    </div>
  );
}
