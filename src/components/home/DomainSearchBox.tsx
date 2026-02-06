import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export function DomainSearchBox() {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [domain, setDomain] = useState('');
  const basePath = language === 'en' ? '/en' : '/bn';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      navigate(`${basePath}/domains?search=${encodeURIComponent(domain.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-3 p-2 rounded-2xl bg-background/80 backdrop-blur-sm border shadow-lg">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t.domainSearch.placeholder}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="pl-12 h-12 border-0 bg-transparent focus-visible:ring-0 text-base"
          />
        </div>
        <Button
          type="submit"
          className="gradient-button h-12 px-8 shrink-0"
        >
          {t.domainSearch.button}
        </Button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {['.com', '.net', '.org', '.com.bd', '.xyz'].map((tld) => (
          <span
            key={tld}
            className="px-3 py-1 rounded-full bg-background/60 backdrop-blur-sm text-xs font-medium text-muted-foreground border"
          >
            {tld}
          </span>
        ))}
      </div>
    </form>
  );
}
