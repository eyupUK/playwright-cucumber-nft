const envKeyFor = (dottedKey: string): string => {
  return dottedKey.replace(/[.\-]/g, '_').toUpperCase();
};

const normalise = (value: string | undefined | null): string | undefined => {
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

export const getOAuthConfig = (dottedKey: string): string | undefined => {
  const envKey = envKeyFor(dottedKey);
  const fromAlias = normalise(process.env[envKey]);
  if (fromAlias) {
    return fromAlias;
  }
  const direct = normalise(process.env[dottedKey]);
  if (direct) {
    return direct;
  }
  return undefined;
};

export const oauthTokenUrl = (): string | undefined => getOAuthConfig('oauth.token_url');
export const oauthClientId = (): string | undefined => getOAuthConfig('oauth.client_id');
export const oauthClientSecret = (): string | undefined => getOAuthConfig('oauth.client_secret');
export const oauthScope = (): string | undefined => getOAuthConfig('oauth.scope');
export const oauthProbeUrl = (): string | undefined => getOAuthConfig('oauth.probe_url');
