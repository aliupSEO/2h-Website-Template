-- Dev seed: default hub admin (runs on `npm run db:reset` locally or `npm run db:seed` on linked remote).
-- Password is for local/staging only — rotate before production.

do $$
declare
  admin_id uuid := 'a0000001-0000-4000-8000-000000000001';
  admin_email text := 'ali@2hws.at';
begin
  if not exists (select 1 from auth.users where email = admin_email) then
    insert into auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    values (
      '00000000-0000-0000-0000-000000000000',
      admin_id,
      'authenticated',
      'authenticated',
      admin_email,
      crypt('Test@1234', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Ali Haider","role":"admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    insert into auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    values (
      gen_random_uuid(),
      admin_id,
      admin_id::text,
      jsonb_build_object('sub', admin_id::text, 'email', admin_email),
      'email',
      now(),
      now(),
      now()
    );
  end if;

  update public.profiles
  set
    full_name = 'Ali Haider',
    role = 'admin',
    is_active = true
  where email = admin_email;
end $$;
