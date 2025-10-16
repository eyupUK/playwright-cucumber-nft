import { Given, When, Then } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { expect } from '@playwright/test';
import {
  assertApiBaseline,
  assertApiBaselineWithoutHsts,
  assertHeaderContains,
  assertHeaderContainsAll,
  assertHeaderEquals,
  assertHeaderPresent,
  getHeaderValue,
  normaliseHeaders,
} from '../../../helper/security/owaspAssertions';

type JsonObject = Record<string, unknown>;

const weatherClient = axios.create({
  timeout: 30_000,
  validateStatus: () => true,
});

let weatherBaseUrl: string;
let weatherApiKey: string | undefined;
let lastResponse: AxiosResponse<JsonObject> | undefined;
let nextResponse: AxiosResponse<JsonObject> | undefined;
let saw429 = false;

const ensureBaseConfigured = (): void => {
  expect(weatherBaseUrl, 'Weather API base URL is not configured').toBeTruthy();
};

const ensureApiKey = (): void => {
  expect(weatherApiKey, 'WEATHERAPI_KEY must be set for this scenario').toBeTruthy();
};

const callCurrentWeather = async (
  params: Record<string, string | number | undefined>,
  method: 'get' | 'post' = 'get',
  data?: JsonObject,
) => {
  ensureBaseConfigured();
  if (method === 'get') {
    lastResponse = await weatherClient.get<JsonObject>('/current.json', {
      baseURL: weatherBaseUrl,
      params,
      headers: { Accept: 'application/json' },
    });
    return;
  }
  lastResponse = await weatherClient.post<JsonObject>(
    '/current.json',
    data ?? {},
    {
      baseURL: weatherBaseUrl,
      params,
      headers: { Accept: 'application/json' },
    },
  );
};

Given('the Weather API base is configured', function () {
  weatherBaseUrl = process.env.WEATHERAPI_BASEURL ?? 'https://api.weatherapi.com/v1';
  weatherApiKey = process.env.WEATHERAPI_KEY;
  expect(weatherApiKey, 'WEATHERAPI_KEY must be set').toBeTruthy();
  expect(weatherBaseUrl, 'Weather API base URL must resolve to HTTPS').toContain('https://');
});

When('I call current weather with an invalid API key', async function () {
  await callCurrentWeather({
    key: 'invalid',
    q: 'London',
  });
});

Then('the response status is not 200', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  expect(lastResponse?.status, 'Expected non-200 status').not.toBe(200);
});

Then('the error payload contains a code and message', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  const payload = lastResponse?.data as JsonObject;
  const error = payload?.error as JsonObject | undefined;
  expect(error, 'Expected error payload').toBeTruthy();
  expect(typeof error?.code === 'number', 'error.code should be numeric').toBe(true);
  expect(
    typeof error?.message === 'string' && (error?.message as string).trim().length > 0,
    'error.message should be populated',
  ).toBe(true);
});

When('I request current weather for {string} with a valid API key', async function (payload: string) {
  ensureApiKey();
  await callCurrentWeather({
    key: weatherApiKey,
    q: payload,
  });
});

Then('the response status is not a server error', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  expect(lastResponse!.status < 500, `Unexpected server error status: ${lastResponse?.status}`).toBe(true);
});

Then('the response content type is JSON', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  const ct = assertHeaderPresent(normaliseHeaders(lastResponse?.headers), 'Content-Type');
  expect(ct.toLowerCase(), 'Content-Type should include application/json').toContain('application/json');
});

Then('the response header {string} equals {string}', function (headerName: string, expected: string) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertHeaderEquals(normaliseHeaders(lastResponse?.headers), headerName, expected);
});

Then('the response header {string} is present', function (headerName: string) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertHeaderPresent(normaliseHeaders(lastResponse?.headers), headerName);
});

Then('the response meets OWASP API baseline for HTTPS endpoints', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertApiBaseline(normaliseHeaders(lastResponse?.headers), true, true);
});

Then('the response meets OWASP API baseline for HTTPS endpoints without HSTS', function () {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertApiBaselineWithoutHsts(normaliseHeaders(lastResponse?.headers), true);
});

When(
  'I preflight current weather CORS for origin {string} method {string} and request headers {string}',
  async function (origin: string, method: string, headersCsv: string) {
    ensureBaseConfigured();
    lastResponse = await weatherClient.options<JsonObject>('/current.json', {
      baseURL: weatherBaseUrl,
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': method,
        'Access-Control-Request-Headers': headersCsv,
      },
    });
  },
);

Then('the response header {string} contains {string}', function (headerName: string, expected: string) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertHeaderContains(normaliseHeaders(lastResponse?.headers), headerName, expected);
});

Then('the response header {string} contains all of {string}', function (headerName: string, csvList: string) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  assertHeaderContainsAll(normaliseHeaders(lastResponse?.headers), headerName, csvList);
});

Then('the response should not allow origin {string}', function (origin: string) {
  expect(lastResponse, 'No response captured').toBeTruthy();
  const allowOrigin = getHeaderValue(normaliseHeaders(lastResponse?.headers), 'Access-Control-Allow-Origin');
  if (!allowOrigin) {
    expect(true).toBe(true);
    return;
  }
  const lowerOrigin = origin.toLowerCase();
  expect(
    allowOrigin.toLowerCase() !== lowerOrigin && allowOrigin !== '*',
    `Expected origin ${origin} not to be allowed (received ${allowOrigin})`,
  ).toBe(true);
});

When('I rapidly call current weather {int} times with a valid API key', async function (times: number) {
  ensureApiKey();
  const override = process.env.RATE_LIMIT_CALLS;
  if (override && /^\d+$/.test(override)) {
    times = Number(override);
  }
  const maxCalls = Math.max(1, times);
  saw429 = false;
  let captured429: AxiosResponse<JsonObject> | undefined;
  let latest: AxiosResponse<JsonObject> | undefined;
  for (let i = 0; i < maxCalls; i += 1) {
    latest = await weatherClient.get<JsonObject>('/current.json', {
      baseURL: weatherBaseUrl,
      params: {
        key: weatherApiKey,
        q: 'London',
      },
      headers: { Accept: 'application/json' },
    });
    if (!saw429 && latest.status === 429) {
      saw429 = true;
      captured429 = latest;
    }
  }
  lastResponse = captured429 ?? latest;
});

Then('I eventually receive a 429 status', function () {
  expect(saw429, 'Did not observe HTTP 429 during rapid calls').toBe(true);
  expect(lastResponse?.status, 'Captured response should be HTTP 429').toBe(429);
});

When('I wait the Retry-After duration then retry the request', async function () {
  ensureApiKey();
  expect(lastResponse?.status, 'Previous response must be available').toBeTruthy();
  const retryAfterHeader = assertHeaderPresent(normaliseHeaders(lastResponse?.headers), 'Retry-After');
  let waitMillis = 2_000;
  if (retryAfterHeader) {
    const trimmed = retryAfterHeader.trim();
    if (/^\d+$/.test(trimmed)) {
      waitMillis = Math.min(10_000, Number(trimmed) * 1_000);
    } else {
      const parsedDate = Date.parse(trimmed);
      if (!Number.isNaN(parsedDate)) {
        const delta = parsedDate - Date.now();
        waitMillis = Math.min(10_000, Math.max(0, delta));
      }
    }
  }
  await new Promise((resolve) => setTimeout(resolve, waitMillis));
  nextResponse = await weatherClient.get<JsonObject>('/current.json', {
    baseURL: weatherBaseUrl,
    params: {
      key: weatherApiKey,
      q: 'London',
    },
    headers: { Accept: 'application/json' },
  });
});

Then('the next response status is not 429', function () {
  expect(nextResponse, 'No follow-up response captured').toBeTruthy();
  expect(nextResponse?.status, 'Follow-up response should not be 429').not.toBe(429);
});
