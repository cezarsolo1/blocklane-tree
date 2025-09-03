import { supabase } from "@/integrations/supabase/client";

const BUCKET = "ticket-photos";

export async function uploadTicketPhoto(userId: string, ticketKey: string, file: File) {
  const filePath = `${userId}/tickets/${ticketKey}/${file.name}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(filePath, file, {
    upsert: true,
  });
  if (error) throw error;
  
  // Return public URL instead of storage path
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
  return { publicUrl };
}

export async function getSignedUrl(path: string, expiresInSeconds = 60 * 60) {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

/**
 * Handles photo URLs - since we now store public URLs directly, just returns them as-is.
 * - If value is already http(s), it is returned as-is.
 * - Legacy support for any remaining storage paths by converting to public URLs.
 */
export async function signTicketPhotoUrls(
  items: string[] | null | undefined,
  expiresInSeconds = 60 * 60
): Promise<string[]> {
  const input = items ?? [];
  if (input.length === 0) return [];

  return input.map(item => {
    if (!item) return item;
    // If it's already a URL, return as-is
    if (/^https?:\/\//i.test(item)) {
      return item;
    }
    // Legacy: convert old storage paths to public URLs
    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(item);
    return publicUrl;
  });
}