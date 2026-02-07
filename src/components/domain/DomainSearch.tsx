import React, { useState } from 'react';
import { Globe, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import { DomainSearchInput } from './DomainSearchInput';
import { DomainSearchResults } from './DomainSearchResults';
import { DomainPricingTable } from './DomainPricingTable';
import { DomainOrderModal } from '@/components/order/DomainOrderModal';
import { domainService, type DomainSearchResult } from '@/services/domainService';
import { toast } from 'sonner';

interface DomainSearchProps {
  showPricingTable?: boolean;
  onOrderDomain?: (result: DomainSearchResult) => void;
}

export function DomainSearch({ showPricingTable = true, onOrderDomain }: DomainSearchProps) {
  const { language } = useLanguage();
  const { user } = useAuth();
  
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<{
    primary: DomainSearchResult;
    alternatives: DomainSearchResult[];
  } | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<DomainSearchResult | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

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

    // Open the domain order modal with bundle options
    setSelectedDomain(result);
    setIsOrderModalOpen(true);
  };

  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedDomain(null);
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

      {/* Domain Order Modal */}
      <DomainOrderModal
        isOpen={isOrderModalOpen}
        onClose={handleCloseOrderModal}
        domain={selectedDomain}
      />
    </div>
  );
}
