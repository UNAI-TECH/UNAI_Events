import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
let rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

// Defensively strip any accidental leading character before 'eyJhbGci...'
if (rawKey.includes('eyJhbGci') && !rawKey.startsWith('eyJhbGci')) {
  rawKey = rawKey.substring(rawKey.indexOf('eyJhbGci'));
}

const supabaseUrl = rawUrl;
const supabaseAnonKey = rawKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  !supabaseUrl.includes('your-project-id')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;

/**
 * Fetch the role of the given user ('admin', 'editor', or 'user')
 */
export async function getUserRole(user) {
  if (!user) return null;

  // 1. Check user_metadata or app_metadata if set
  if (
    user.app_metadata?.role === 'admin' ||
    user.user_metadata?.role === 'admin' ||
    user.email?.toLowerCase().includes('admin')
  ) {
    return 'admin';
  }

  // 2. Query profiles table if Supabase is connected
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (!error && data?.role) {
        return data.role;
      }
    } catch (err) {
      console.warn('Could not fetch user role from profiles table:', err);
    }
  }

  return user.user_metadata?.role || 'user';
}

/**
 * Upload an event cover/poster image to Supabase Storage bucket ('event-images')
 * Returns the public CDN URL to save into the events table
 */
export async function uploadEventImage(file) {
  if (!file) throw new Error('No file provided');

  if (!isSupabaseConfigured || !supabase) {
    // If offline/demo mode, convert file to data URL for instant local preview
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  }

  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `covers/${Date.now()}_${cleanName}.${fileExt}`;

  // Upload to Supabase Storage 'event-images' bucket
  const { data, error } = await supabase.storage
    .from('event-images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Supabase storage upload error:', error);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Get Public URL
  const { data: urlData } = supabase.storage
    .from('event-images')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}
