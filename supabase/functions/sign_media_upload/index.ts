import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SignMediaUploadRequest {
  ticket_id: string;
  files: Array<{
    name: string;
    size: number;
    type: string;
  }>;
}

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/webp',
  'image/heic'
]

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_FILES = 8

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get auth header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get user from JWT
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { ticket_id, files }: SignMediaUploadRequest = await req.json()

    // Validate input
    if (!ticket_id || !files) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ticket_id, files' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!Array.isArray(files) || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Files array is required and cannot be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (files.length > MAX_FILES) {
      return new Response(
        JSON.stringify({ error: `Maximum ${MAX_FILES} files allowed` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('auth_user_id', user.id)
      .single()

    if (!profile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify ticket belongs to user and is in draft status
    const { data: ticket } = await supabase
      .from('tickets')
      .select('id, status')
      .eq('id', ticket_id)
      .eq('profile_id', profile.id)
      .single()

    if (!ticket) {
      return new Response(
        JSON.stringify({ error: 'Ticket not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (ticket.status !== 'draft') {
      return new Response(
        JSON.stringify({ error: 'Can only upload media to draft tickets' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate each file
    const validatedFiles = []
    for (const file of files) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return new Response(
          JSON.stringify({ error: `File ${file.name} is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check MIME type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return new Response(
          JSON.stringify({ error: `File ${file.name} has unsupported type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      validatedFiles.push(file)
    }

    // Generate signed URLs and create media asset records
    const bucketName = 'media-assets'
    const uploads = []

    for (const file of validatedFiles) {
      const mediaId = crypto.randomUUID()
      const fileExtension = file.name.split('.').pop()
      const storagePath = `${ticket_id}/${mediaId}.${fileExtension}`

      // Generate signed URL for upload
      const { data: signedUrl, error: signError } = await supabase.storage
        .from(bucketName)
        .createSignedUploadUrl(storagePath)

      if (signError) {
        console.error('Failed to generate signed URL:', signError)
        return new Response(
          JSON.stringify({ error: 'Failed to generate signed URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create media asset record
      const { data: mediaAsset, error: insertError } = await supabase
        .from('media_assets')
        .insert({
          id: mediaId,
          ticket_id,
          kind: file.type.startsWith('image/') ? 'image' : 'video',
          mime: file.type,
          size_bytes: file.size,
          storage_path: storagePath,
          needs_conversion: file.type === 'image/heic'
        })
        .select('id')
        .single()

      if (insertError) {
        console.error('Failed to create media asset record:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create media asset record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      uploads.push({
        media_id: mediaId,
        put_url: signedUrl.signedUrl,
        storage_path: storagePath,
        original_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        needs_conversion: file.type === 'image/heic',
        kind: file.type.startsWith('image/') ? 'image' : 'video'
      })
    }

    return new Response(
      JSON.stringify({ 
        ok: true, 
        data: { 
          uploads 
        } 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Sign media upload error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
