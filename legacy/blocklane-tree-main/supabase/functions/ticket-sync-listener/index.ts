import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const syncFunctionUrl = `${supabaseUrl}/functions/v1/sync-to-external-api`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Ticket sync listener started');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Listen to real-time changes on tickets table
    const channel = supabase
      .channel('ticket-sync-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tickets'
        },
        async (payload) => {
          console.log('Ticket change detected:', payload);
          
          try {
            // Call the sync function with the payload
            const syncResponse = await fetch(syncFunctionUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                operation: payload.eventType,
                table: 'tickets',
                data: payload.new,
                old_data: payload.old,
                timestamp: new Date().toISOString()
              }),
            });

            if (syncResponse.ok) {
              console.log('Successfully triggered sync to external API');
            } else {
              console.error('Failed to sync to external API:', await syncResponse.text());
            }
          } catch (error) {
            console.error('Error calling sync function:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ticket_messages'
        },
        async (payload) => {
          console.log('Ticket message change detected:', payload);
          
          try {
            // Call the sync function with the payload
            const syncResponse = await fetch(syncFunctionUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseServiceKey}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                operation: payload.eventType,
                table: 'ticket_messages',
                data: payload.new,
                old_data: payload.old,
                timestamp: new Date().toISOString()
              }),
            });

            if (syncResponse.ok) {
              console.log('Successfully triggered sync for ticket message');
            } else {
              console.error('Failed to sync ticket message:', await syncResponse.text());
            }
          } catch (error) {
            console.error('Error calling sync function for ticket message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });

    // Keep the function alive
    return new Response(
      JSON.stringify({ 
        message: 'Ticket sync listener is running',
        status: 'active' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in ticket sync listener:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to start sync listener', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
