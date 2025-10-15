import { expect } from '@playwright/test';

type HeaderValue = string | string[] | number | boolean | null | undefined;

export type HeaderBag = Record<string, HeaderValue>;

const toHeaderValue = (value: HeaderValue): string | undefined => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return undefined;
};

const lookupHeader = (headers: HeaderBag | undefined, name: string): string | undefined => {
  if (!headers) {
    return undefined;
  }
  const lower = name.toLowerCase();
  const direct = headers[lower] ?? headers[name];
  if (direct !== undefined) {
    return toHeaderValue(direct)?.trim();
  }
  // Axios occasionally stores headers using canonicalised casing (e.g. content-type)
  for (const key of Object.keys(headers)) {
    if (key.toLowerCase() === lower) {
      return toHeaderValue(headers[key])?.trim();
    }
  }
  return undefined;
};

export const normaliseHeaders = (headers: unknown): HeaderBag | undefined => {
  if (!headers) {
    return undefined;
  }
  if (typeof headers === 'object' && headers !== null) {
    const maybeJson = headers as { toJSON?: () => Record<string, HeaderValue> };
    if (typeof maybeJson.toJSON === 'function') {
      return maybeJson.toJSON() as HeaderBag;
    }
  }
  return headers as HeaderBag;
};

export const getHeaderValue = (headers: HeaderBag | undefined, name: string): string | undefined => {
  return lookupHeader(headers, name);
};

export const assertApiBaseline = (
  headers: HeaderBag | undefined,
  httpsExpected = true,
  requireHsts = true,
): void => {
  expect(headers, 'Response headers must be available for OWASP API baseline checks').toBeTruthy();
  const xcto = lookupHeader(headers, 'X-Content-Type-Options');
  expect(xcto, 'Missing X-Content-Type-Options header').toBeTruthy();
  expect(xcto?.toLowerCase(), 'X-Content-Type-Options should be "nosniff"').toBe('nosniff');

  if (httpsExpected && requireHsts) {
    const hsts = lookupHeader(headers, 'Strict-Transport-Security');
    expect(hsts, 'Missing Strict-Transport-Security header for HTTPS endpoint').toBeTruthy();
  }
};

export const assertApiBaselineWithoutHsts = (
  headers: HeaderBag | undefined,
  httpsExpected = true,
): void => {
  assertApiBaseline(headers, httpsExpected, false);
};

export const assertHtmlBaseline = (headers: HeaderBag | undefined, httpsExpected = true): void => {
  expect(headers, 'Response headers must be available for OWASP HTML baseline checks').toBeTruthy();

  const xcto = lookupHeader(headers, 'X-Content-Type-Options');
  expect(xcto, 'Missing X-Content-Type-Options header').toBeTruthy();
  expect(xcto?.toLowerCase(), 'X-Content-Type-Options should be "nosniff"').toBe('nosniff');

  const xfo = lookupHeader(headers, 'X-Frame-Options');
  const csp = lookupHeader(headers, 'Content-Security-Policy');
  const hasFrameAncestors = csp?.toLowerCase().includes('frame-ancestors') ?? false;
  const hasXfo = typeof xfo === 'string' && xfo.length > 0;

  expect(
    hasXfo || hasFrameAncestors,
    'Expected either X-Frame-Options header or Content-Security-Policy with frame-ancestors directive',
  ).toBeTruthy();

  const referrerPolicy = lookupHeader(headers, 'Referrer-Policy');
  expect(referrerPolicy, 'Missing Referrer-Policy header').toBeTruthy();

  const permissionsPolicy = lookupHeader(headers, 'Permissions-Policy');
  expect(permissionsPolicy, 'Missing Permissions-Policy header').toBeTruthy();

  if (httpsExpected) {
    const hsts = lookupHeader(headers, 'Strict-Transport-Security');
    expect(hsts, 'Missing Strict-Transport-Security header for HTTPS endpoint').toBeTruthy();
  }
};

export const assertHeaderPresent = (
  headers: HeaderBag | undefined,
  name: string,
): string => {
  const value = lookupHeader(headers, name);
  expect(value, `Missing header: ${name}`).toBeTruthy();
  return value ?? '';
};

export const assertHeaderEquals = (
  headers: HeaderBag | undefined,
  name: string,
  expected: string,
): void => {
  const value = assertHeaderPresent(headers, name);
  expect(value.toLowerCase(), `Header mismatch for ${name}`).toBe(expected.toLowerCase());
};

export const assertHeaderContains = (
  headers: HeaderBag | undefined,
  name: string,
  expected: string,
): void => {
  const value = assertHeaderPresent(headers, name);
  expect(
    value.toLowerCase(),
    `Header '${name}' does not contain '${expected}'`,
  ).toContain(expected.toLowerCase());
};

export const assertHeaderContainsAll = (
  headers: HeaderBag | undefined,
  name: string,
  csvList: string,
): void => {
  const value = assertHeaderPresent(headers, name);
  const lowerValue = value.toLowerCase();
  for (const token of csvList.split(',')) {
    const t = token.trim();
    if (t.length === 0) continue;
    expect(
      lowerValue,
      `Header '${name}' missing token '${t}'`,
    ).toContain(t.toLowerCase());
  }
};
