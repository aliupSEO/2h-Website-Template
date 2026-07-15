/**
 * Hand-aligned with `supabase/migrations/20260715132806_create_profiles_and_clients.sql`.
 * Prefer regenerating after migrate: `npm run db:types`
 */
export type Json = string | number | boolean | null | {
    [key: string]: Json | undefined;
} | Json[];
export type AppRole = 'admin' | 'manager' | 'user';
export type ClientStatus = 'active' | 'inactive' | 'draft';
export type ClientFileKind = 'logo' | 'asset' | 'document';
export type Database = {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string;
                    email: string;
                    full_name: string | null;
                    role: AppRole;
                    avatar_url: string | null;
                    is_active: boolean;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id: string;
                    email: string;
                    full_name?: string | null;
                    role?: AppRole;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    email?: string;
                    full_name?: string | null;
                    role?: AppRole;
                    avatar_url?: string | null;
                    is_active?: boolean;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                ];
            };
            clients: {
                Row: {
                    id: string;
                    name: string;
                    email: string;
                    phone: string;
                    status: ClientStatus;
                    notes: string | null;
                    created_by: string | null;
                    updated_by: string | null;
                    created_at: string;
                    updated_at: string;
                };
                Insert: {
                    id?: string;
                    name: string;
                    email: string;
                    phone?: string;
                    status?: ClientStatus;
                    notes?: string | null;
                    created_by?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Update: {
                    id?: string;
                    name?: string;
                    email?: string;
                    phone?: string;
                    status?: ClientStatus;
                    notes?: string | null;
                    created_by?: string | null;
                    updated_by?: string | null;
                    created_at?: string;
                    updated_at?: string;
                };
                Relationships: [
                ];
            };
            client_links: {
                Row: {
                    id: string;
                    client_id: string;
                    title: string;
                    url: string;
                    sort_order: number;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    title: string;
                    url: string;
                    sort_order?: number;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    title?: string;
                    url?: string;
                    sort_order?: number;
                    created_at?: string;
                };
                Relationships: [
                ];
            };
            client_files: {
                Row: {
                    id: string;
                    client_id: string;
                    kind: ClientFileKind;
                    name: string;
                    mime_type: string;
                    size_bytes: number;
                    storage_path: string;
                    created_at: string;
                };
                Insert: {
                    id?: string;
                    client_id: string;
                    kind: ClientFileKind;
                    name: string;
                    mime_type: string;
                    size_bytes: number;
                    storage_path: string;
                    created_at?: string;
                };
                Update: {
                    id?: string;
                    client_id?: string;
                    kind?: ClientFileKind;
                    name?: string;
                    mime_type?: string;
                    size_bytes?: number;
                    storage_path?: string;
                    created_at?: string;
                };
                Relationships: [
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            current_app_role: {
                Args: Record<string, never>;
                Returns: AppRole;
            };
            has_app_role: {
                Args: {
                    allowed: AppRole[];
                };
                Returns: boolean;
            };
        };
        Enums: {
            app_role: AppRole;
            client_status: ClientStatus;
            client_file_kind: ClientFileKind;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};
