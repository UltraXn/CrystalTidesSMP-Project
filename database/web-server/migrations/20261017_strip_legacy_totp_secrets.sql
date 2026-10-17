-- Maintenance: remove legacy TOTP secrets from app_metadata
-- Date: 2026-10-17
--
-- RUN MANUALLY, ONLY AFTER the web-server that reads public.user_totp_secrets
-- is deployed. Running it earlier locks admins out of 2FA-protected actions
-- until the new server is live.
--
-- Every secret stored in app_metadata was exposed inside access tokens, so it
-- must be treated as compromised. Affected users see 2FA as disabled and have
-- to enroll again (Account > Security). Revoke admin sessions before admins
-- re-enroll, so a stolen session cannot enroll its own authenticator first.

-- 1) Who is affected (review before running step 2):
SELECT id, email, raw_app_meta_data ->> 'two_factor_enabled' AS two_factor_enabled
FROM auth.users
WHERE raw_app_meta_data ? 'two_factor_secret';

-- 2) Strip the secret and reset the flag:
UPDATE auth.users
SET raw_app_meta_data = (raw_app_meta_data - 'two_factor_secret')
    || jsonb_build_object('two_factor_enabled', false)
WHERE raw_app_meta_data ? 'two_factor_secret';
