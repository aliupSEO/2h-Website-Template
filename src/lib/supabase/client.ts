import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';
import { getSupabaseBrowserEnv } from '@/lib/supabase/env';
let browserClient: SupabaseClient<Database> | null = null;
export const getSupabaseClient = () => {
    if (browserClient)
        return browserClient;
    const { url, anonKey } = getSupabaseBrowserEnv();
    browserClient = createClient<Database>(url, anonKey, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
        },
    });
    return browserClient;
};
export type HubSupabaseClient = SupabaseClient<Database>;
