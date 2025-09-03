import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const externalApiUrl = Deno.env.get('EXTERNAL_API_URL');
const externalApiKey = Deno.env.get('EXTERNAL_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Sync to external API function called');

    if (!externalApiUrl) {
      console.error('EXTERNAL_API_URL environment variable is not set');
      return new Response(
        JSON.stringify({ error: 'EXTERNAL_API_URL not configured' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get the payload from the request (sent by database trigger or manual call)
    const payload = await req.json();
    console.log('Received payload:', JSON.stringify(payload, null, 2));

    // Prepare headers for external API
    const apiHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if API key is provided
    if (externalApiKey) {
      apiHeaders['Authorization'] = `Bearer ${externalApiKey}`;
      // Alternative: apiHeaders['X-API-Key'] = externalApiKey;
    }

    // Send data to external API
    console.log(`Sending data to external API: ${externalApiUrl}`);
    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: apiHeaders,
      body: JSON.stringify({
        source: 'supabase-tickets-sync',
        ...payload
      }),
    });

    const responseText = await response.text();
    console.log(`External API response status: ${response.status}`);
    console.log(`External API response: ${responseText}`);

    if (!response.ok) {
      throw new Error(`External API error: ${response.status} - ${responseText}`);
    }

    // Log successful sync (optional - you can also store in a sync_log table)
    console.log('Successfully synced data to external API');

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Data synced to external API',
        externalResponse: responseText 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error syncing to external API:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to sync to external API', 
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});