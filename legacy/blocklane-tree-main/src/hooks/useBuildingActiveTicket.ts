import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export type BuildingTicket = {
  id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | string;
  created_at: string;
  decision_path: any; // JSON from database
  assigned_vendor?: string | null; // optional if present in schema
  vendor?: string | null;          // fallbacks
  contractor_name?: string | null;
};

export function useBuildingActiveTicket() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<BuildingTicket | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        if (!user) {
          setTicket(null);
          return;
        }
        // 1) fetch profile to get building_key
        const { data: profile, error: pErr } = await supabase
          .from('profiles')
          .select('building_key')
          .eq('user_id', user.id)
          .maybeSingle();
        if (pErr) throw pErr;

        if (!profile?.building_key) {
          setTicket(null);
          return;
        }

        // 2) find any active ticket in the same building
        const { data: active, error: aErr } = await supabase
          .from('tickets')
          .select('*')
          .eq('building_key', profile.building_key)
          .in('status', ['OPEN', 'IN_PROGRESS'])
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (aErr) throw aErr;

        setTicket(active ?? null);
      } catch (e) {
        console.error('useBuildingActiveTicket error:', e);
        setTicket(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [user]);

  return { loading, ticket };
}