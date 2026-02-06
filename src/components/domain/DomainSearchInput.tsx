import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/lib/i18n';

interface DomainSearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  size?: 'default' | 'lg';
}

export function DomainSearchInput({
  onSearch,
  isLoading = false,
  placeholder,
  size = 'default',
}: DomainSearchInputProps) {
  const { language } = useLanguage();
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const defaultPlaceholder = language === 'bn' 
    ? 'আপনার ডোমেইন নাম খুঁজুন (যেমন: example.com)' 
    : 'Search your domain name (e.g., example.com)';

  const isLarge = size === 'lg';

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className={`flex gap-2 ${isLarge ? 'flex-col sm:flex-row' : ''}`}>
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground ${isLarge ? 'h-5 w-5' : 'h-4 w-4'}`} />
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder || defaultPlaceholder}
            className={`pl-10 ${isLarge ? 'h-14 text-lg' : ''}`}
            disabled={isLoading}
          />
        </div>
        <Button 
          type="submit" 
          disabled={!query.trim() || isLoading}
          size={isLarge ? 'lg' : 'default'}
          className={isLarge ? 'h-14 px-8 text-lg' : ''}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              {language === 'bn' ? 'খুঁজছি...' : 'Searching...'}
            </>
          ) : (
            language === 'bn' ? 'খুঁজুন' : 'Search'
          )}
        </Button>
      </div>
    </form>
  );
}
