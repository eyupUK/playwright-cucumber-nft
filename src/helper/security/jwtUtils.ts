import { Buffer } from 'node:buffer';

export const isLikelyJwt = (token: string | undefined | null): boolean => {
  if (!token) {
    return false;
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  return parts.every((part) => part.length > 0 && /^[A-Za-z0-9_-]+$/.test(part));
};

const decodeBase64Url = (input: string): string | undefined => {
  try {
    return Buffer.from(input, 'base64url').toString('utf-8');
  } catch (error) {
    return undefined;
  }
};

const decodePart = (token: string | undefined, index: number): string | undefined => {
  if (!token) {
    return undefined;
  }
  const parts = token.split('.');
  if (parts.length <= index) {
    return undefined;
  }
  return decodeBase64Url(parts[index]);
};

const safeParseJson = (value: string | undefined): Record<string, unknown> => {
  if (!value) {
    return {};
  }
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch (error) {
    // ignore parsing errors
  }
  return {};
};

export const decodeHeader = (token: string | undefined): Record<string, unknown> => {
  return safeParseJson(decodePart(token, 0));
};

export const decodePayload = (token: string | undefined): Record<string, unknown> => {
  return safeParseJson(decodePart(token, 1));
};

export const getClaimAsString = (token: string | undefined, claim: string): string | undefined => {
  const payload = decodePayload(token);
  const value = payload[claim];
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
};

export const getClaimAsNumber = (token: string | undefined, claim: string): number | undefined => {
  const payload = decodePayload(token);
  const value = payload[claim];
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return undefined;
};

export const getExpiration = (token: string | undefined): number | undefined => {
  return getClaimAsNumber(token, 'exp');
};

export const isExpired = (
  token: string | undefined,
  clockSkewSeconds = 0,
): boolean => {
  const exp = getExpiration(token);
  if (exp === undefined) {
    return false;
  }
  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp + clockSkewSeconds < nowSeconds;
};

