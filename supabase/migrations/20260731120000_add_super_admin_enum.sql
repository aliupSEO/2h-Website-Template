-- Add super_admin to app_role (must commit before using the value).
alter type public.app_role add value if not exists 'super_admin';
