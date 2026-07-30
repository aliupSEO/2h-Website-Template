import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../src/lib/supabase/database.types.js';

let adminClient: SupabaseClient<Database> | null = null;

export const getSupabaseAdminClient = (): SupabaseClient<Database> => {
    if (adminClient) return adminClient;

    const url = process.env.SUPABASE_URL?.trim();
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

    if (!url || !serviceRoleKey) {
        throw new Error(
            'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set for admin operations',
        );
    }

    adminClient = createClient<Database>(url, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });

    return adminClient;
};
