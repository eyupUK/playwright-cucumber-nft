import { Given, When, Then } from '@cucumber/cucumber';
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { expect } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import {
  decodeHeader,
  decodePayload,
  isExpired,
  isLikelyJwt,
} from '../../../helper/security/jwtUtils';

type JsonObject = Record<string, unknown>;

const jwtClient: AxiosInstance = axios.create({
  timeout: 30_000,
  validateStatus: () => true,
});

let jwtBaseUrl: string;
let email: string | undefined;
const password = 'pass123';
let accessToken: string | undefined;
let lastResponse: AxiosResponse<JsonObject> | undefined;

const wait = async (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const registerUserIfNeeded = async (): Promise<void> => {
  if (!email) {
    email = `john.${randomUUID().replace(/-/g, '').slice(0, 12)}@example.com`;
  }
  const payload = {
    name: 'John Doe',
    email,
    password,
    avatar: 'https://i.pravatar.cc/150?img=3',
  };
  let attempt = 0;
  let backoff = 500;
  while (attempt < 5) {
    attempt += 1;
    const response = await jwtClient.post<JsonObject>('/users', payload, {
      baseURL: jwtBaseUrl,
    });
    if (response.status >= 200 && response.status < 300) {
      return;
    }
    if ((response.status === 429 || response.status >= 500) && attempt < 5) {
      await wait(backoff);
      backoff = Math.min(backoff * 2, 4_000);
      continue;
    }
    throw new Error(`User registration failed with status ${response.status}`);
  }
  throw new Error('User registration failed after retries');
};

Given('the Demo JWT API base is configured', function () {
  jwtBaseUrl = process.env.DEMO_JWT_API_BASE ?? 'https://api.escuelajs.co/api/v1';
  expect(jwtBaseUrl, 'Demo JWT base URL must use HTTPS').toContain('https://');
});

When('I register a demo user and authenticate', async function () {
  await registerUserIfNeeded();
  const payload = {
    email,
    password,
  };
  const response = await jwtClient.post<JsonObject>('/auth/login', payload, {
    baseURL: jwtBaseUrl,
  });
  lastResponse = response;
  const tokenCandidate = response.data['access_token'];
  accessToken = typeof tokenCandidate === 'string' ? tokenCandidate : undefined;
});

Then('I receive a JWT bearer token', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  expect(lastResponse!.status >= 200 && lastResponse!.status < 300, `Unexpected status ${lastResponse?.status}`).toBe(
    true,
  );
  expect(accessToken, 'No access token in response').toBeTruthy();
  expect(isLikelyJwt(accessToken), 'Access token does not look like a JWT').toBe(true);
});

Then('the JWT header includes an algorithm', function () {
  expect(accessToken, 'No JWT token available').toBeTruthy();
  const header = decodeHeader(accessToken);
  const alg = header.alg;
  expect(typeof alg === 'string' && alg.trim().length > 0, 'JWT header.alg is missing').toBe(true);
});

Then('the JWT payload is a valid JSON object', function () {
  expect(accessToken, 'No JWT token available').toBeTruthy();
  const payload = decodePayload(accessToken);
  expect(Object.keys(payload).length > 0, 'JWT payload should not be empty').toBe(true);
  if (typeof payload.sub === 'string') {
    expect(payload.sub.trim().length > 0, 'JWT sub claim should not be blank').toBe(true);
  }
  if (typeof payload.iss === 'string') {
    expect(payload.iss.trim().length > 0, 'JWT iss claim should not be blank').toBe(true);
  }
  if (typeof payload.aud === 'string') {
    expect(payload.aud.trim().length > 0, 'JWT aud claim should not be blank').toBe(true);
  }
  if (payload.exp !== undefined) {
    expect(isExpired(accessToken, 60), 'JWT should not be expired').toBe(false);
  }
});

Given('I have a JWT bearer token', async function () {
  if (accessToken) {
    return;
  }
  await registerUserIfNeeded();
  const payload = {
    email,
    password,
  };
  const response = await jwtClient.post<JsonObject>('/auth/login', payload, {
    baseURL: jwtBaseUrl,
  });
  lastResponse = response;
  const tokenCandidate = response.data['access_token'];
  accessToken = typeof tokenCandidate === 'string' ? tokenCandidate : undefined;
  expect(accessToken, 'Failed to obtain JWT bearer token').toBeTruthy();
  expect(isLikelyJwt(accessToken), 'Access token does not look like a JWT').toBe(true);
});

When('I call a protected demo endpoint with the token', async function () {
  expect(accessToken, 'No JWT token available').toBeTruthy();
  lastResponse = await jwtClient.get<JsonObject>('/auth/profile', {
    baseURL: jwtBaseUrl,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
});

Then('the status code is {int}', function (expected: number) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  expect(lastResponse!.status, `Unexpected status: ${lastResponse?.status}`).toBe(expected);
});

When('I ensure a demo user is registered', async function () {
  await registerUserIfNeeded();
});

When('I authenticate with an incorrect password', async function () {
  expect(email, 'Email must be set before authentication').toBeTruthy();
  const payload = {
    email,
    password: `wrong-${password}`,
  };
  lastResponse = await jwtClient.post<JsonObject>('/auth/login', payload, {
    baseURL: jwtBaseUrl,
  });
});

Then('the token endpoint returns an error status', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  expect(lastResponse!.status >= 400, `Expected error status, got ${lastResponse?.status}`).toBe(true);
  const tokenCandidate = lastResponse?.data ? lastResponse.data['access_token'] : undefined;
  if (typeof tokenCandidate === 'string') {
    expect(tokenCandidate.trim().length === 0, 'Should not receive an access token on error').toBe(true);
  }
});

When('I call a protected demo endpoint with a tampered token', async function () {
  expect(accessToken, 'No JWT token available').toBeTruthy();
  let tampered = accessToken!;
  if (tampered.length > 10) {
    const lastChar = tampered.slice(-1);
    tampered = `${tampered.slice(0, -1)}${lastChar === 'a' ? 'b' : 'a'}`;
  } else {
    tampered = `${tampered}x`;
  }
  lastResponse = await jwtClient.get<JsonObject>('/auth/profile', {
    baseURL: jwtBaseUrl,
    headers: {
      Authorization: `Bearer ${tampered}`,
      Accept: 'application/json',
    },
  });
});

Then('the status is one of 401 or 403', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  const status = lastResponse!.status;
  expect(status === 401 || status === 403, `Expected 401 or 403, got ${status}`).toBe(true);
});
