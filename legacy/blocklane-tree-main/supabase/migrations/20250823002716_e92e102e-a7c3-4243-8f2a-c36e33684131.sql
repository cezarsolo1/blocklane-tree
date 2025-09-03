-- Allow all authenticated users to view all tickets
DROP POLICY IF EXISTS "Tenants can view their own tickets" ON public.tickets;
DROP POLICY IF EXISTS "tickets read own" ON public.tickets;

-- Create new policy allowing all authenticated users to view all tickets
CREATE POLICY "Authenticated users can view all tickets" 
ON public.tickets 
FOR SELECT 
TO authenticated
USING (true);