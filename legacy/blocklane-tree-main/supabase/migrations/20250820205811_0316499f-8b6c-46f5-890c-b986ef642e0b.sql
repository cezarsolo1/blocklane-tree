-- Create storage bucket for ticket photos
INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-photos', 'ticket-photos', false);

-- Create tickets table
CREATE TABLE public.tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  tenant_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'IN_PROGRESS', 'DONE')),
  decision_path JSONB NOT NULL,
  leaf_type TEXT NOT NULL CHECK (leaf_type IN ('RESPONSIBILITY', 'FIX_VIDEO', 'DESCRIBE', 'EMERGENCY')),
  description TEXT,
  photo_urls JSONB DEFAULT '[]'::jsonb,
  contractor_id UUID REFERENCES public.profiles(user_id),
  
  -- Address information
  street_address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  
  -- Contact information  
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT
);

-- Create contractor rules table
CREATE TABLE public.contractor_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  pm_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  node_key TEXT NOT NULL,
  contractor_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT
);

-- Create vendor tokens table for external contractor access
CREATE TABLE public.vendor_tokens (
  token UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '30 days')
);

-- Enable RLS on all tables
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendor_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets (tenants can view their own, PMs can view all)
CREATE POLICY "Tenants can view their own tickets" 
ON public.tickets 
FOR SELECT 
USING (auth.uid() = tenant_id);

CREATE POLICY "Tenants can create their own tickets" 
ON public.tickets 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "PMs can view all tickets" 
ON public.tickets 
FOR SELECT 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'PM');

CREATE POLICY "PMs can update all tickets" 
ON public.tickets 
FOR UPDATE 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'PM');

-- RLS Policies for contractor rules (only PMs can manage)
CREATE POLICY "PMs can manage contractor rules" 
ON public.contractor_rules 
FOR ALL 
USING ((SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'PM');

-- RLS Policies for vendor tokens (no direct access, handled by functions)
CREATE POLICY "No direct access to vendor tokens" 
ON public.vendor_tokens 
FOR ALL 
USING (false);

-- Storage policies for ticket photos
CREATE POLICY "Users can view their own ticket photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ticket-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can upload their own ticket photos" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'ticket-photos' AND 
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "PMs can view all ticket photos" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'ticket-photos' AND 
  (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = 'PM'
);

-- Add triggers for updated_at
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();