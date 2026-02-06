-- Create domain_pricing table for TLD pricing
CREATE TABLE public.domain_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tld VARCHAR(20) NOT NULL UNIQUE,
  base_price NUMERIC NOT NULL DEFAULT 0,
  renewal_price NUMERIC NOT NULL DEFAULT 0,
  transfer_price NUMERIC NOT NULL DEFAULT 0,
  margin_percent NUMERIC DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'BDT',
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create domain_search_logs table
CREATE TABLE public.domain_search_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  domain_name VARCHAR(255) NOT NULL,
  tld VARCHAR(20) NOT NULL,
  is_available BOOLEAN,
  price_shown NUMERIC,
  search_source VARCHAR(50) DEFAULT 'web',
  ip_address VARCHAR(45),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.domain_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_search_logs ENABLE ROW LEVEL SECURITY;

-- Domain pricing policies
CREATE POLICY "Anyone can view active domain pricing" 
ON public.domain_pricing 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage domain pricing" 
ON public.domain_pricing 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Domain search logs policies
CREATE POLICY "Users can view own search logs" 
ON public.domain_search_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can insert search logs" 
ON public.domain_search_logs 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all search logs" 
ON public.domain_search_logs 
FOR SELECT 
USING (is_admin_or_staff(auth.uid()));

-- Insert default TLD pricing (Bangladesh market focused)
INSERT INTO public.domain_pricing (tld, base_price, renewal_price, transfer_price, margin_percent, is_popular, sort_order) VALUES
('.com', 1200, 1400, 1300, 10, true, 1),
('.net', 1100, 1300, 1200, 10, true, 2),
('.org', 1100, 1300, 1200, 10, true, 3),
('.info', 800, 1000, 900, 10, false, 4),
('.biz', 900, 1100, 1000, 10, false, 5),
('.com.bd', 2500, 2500, 2500, 5, true, 6),
('.net.bd', 2500, 2500, 2500, 5, false, 7),
('.org.bd', 2500, 2500, 2500, 5, false, 8),
('.edu.bd', 1500, 1500, 1500, 5, false, 9),
('.xyz', 500, 1200, 1100, 15, false, 10),
('.online', 600, 1300, 1200, 15, false, 11),
('.store', 700, 1400, 1300, 15, false, 12),
('.tech', 800, 1500, 1400, 15, false, 13),
('.io', 4500, 5000, 4800, 10, true, 14),
('.co', 2800, 3000, 2900, 10, false, 15);

-- Create index for faster lookups
CREATE INDEX idx_domain_pricing_tld ON public.domain_pricing(tld);
CREATE INDEX idx_domain_pricing_active ON public.domain_pricing(is_active);
CREATE INDEX idx_domain_search_logs_domain ON public.domain_search_logs(domain_name, tld);
CREATE INDEX idx_domain_search_logs_user ON public.domain_search_logs(user_id);