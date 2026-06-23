alter table membros.people
add column if not exists privacy_consent boolean not null default false,
add column if not exists privacy_consent_at timestamptz,
add column if not exists privacy_consent_version text;

alter table membros.user_profiles
add column if not exists privacy_consent boolean not null default false,
add column if not exists privacy_consent_at timestamptz,
add column if not exists privacy_consent_version text,
add column if not exists data_responsibility_consent boolean not null default false,
add column if not exists data_responsibility_consent_at timestamptz,
add column if not exists data_responsibility_version text;
