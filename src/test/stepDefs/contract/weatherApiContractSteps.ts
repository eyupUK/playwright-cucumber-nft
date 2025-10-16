import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { AxiosResponse } from 'axios';
import { validator } from '@exodus/schemasafe';
import path from 'node:path';
import fs from 'node:fs';
import APIUtils from '../../../helper/util/apiUtils';

type ContractDefinition = {
  method: 'get' | 'post';
  endpoint: string;
  query?: Record<string, string | number>;
  headers?: Record<string, string>;
  body?: Record<string, unknown>;
  expectedStatus: number;
  schema?: string;
  includeApiKey?: boolean;
  assertions?: (payload: any, response: AxiosResponse) => void;
};

const contractDefinitions: Record<string, ContractDefinition> = {
  WeatherApiConsumerPactTest: {
    method: 'get',
    endpoint: '/current.json',
    query: { q: 'London' },
    expectedStatus: 200,
    schema: 'current_schema.json',
    assertions: (payload) => {
      expect(payload?.location?.name, 'Expected location.name to be London').toBe('London');
      expect(payload?.location?.country, 'Expected location.country to be United Kingdom').toBe('United Kingdom');
      expect(typeof payload?.current?.temp_c === 'number', 'Expected current.temp_c to be numeric').toBe(true);
    },
  },
  WeatherApiCoordinatesPactTest: {
    method: 'get',
    endpoint: '/current.json',
    query: { q: '48.8567,2.3508' },
    expectedStatus: 200,
    schema: 'current_schema.json',
    assertions: (payload) => {
      expect(payload?.location?.name, 'Expected location.name to include Paris').toContain('Paris');
      expect(payload?.location?.country, 'Expected country to be France').toBe('France');
      expect(Math.abs((payload?.location?.lat ?? 0) - 48.8567) < 0.5, 'Latitude should match coordinates').toBe(true);
      expect(Math.abs((payload?.location?.lon ?? 0) - 2.3508) < 0.5, 'Longitude should match coordinates').toBe(true);
    },
  },
  WeatherApiZipCodePactTest: {
    method: 'get',
    endpoint: '/current.json',
    query: { q: '90201' },
    expectedStatus: 200,
    schema: 'current_schema.json',
    assertions: (payload) => {
      const locationName = (payload?.location?.name ?? '').toString().toLowerCase();
      expect(locationName.includes('bell'), 'Expected location name to reference Bell Gardens').toBe(true);
      expect(typeof payload?.current?.temp_c === 'number', 'Expected current.temp_c to be numeric').toBe(true);
    },
  },
  WeatherApiForecastPactTest: {
    method: 'get',
    endpoint: '/forecast.json',
    query: { q: 'London', days: 3 },
    expectedStatus: 200,
    schema: 'forecast_schema.json',
    assertions: (payload) => {
      const forecastDays = payload?.forecast?.forecastday ?? [];
      expect(Array.isArray(forecastDays), 'forecast.forecastday should be an array').toBe(true);
      expect(forecastDays.length >= 3, 'Expected at least 3 forecast days').toBe(true);
    },
  },
  WeatherApiErrorsPactTest: {
    method: 'get',
    endpoint: '/current.json',
    expectedStatus: 400,
    schema: 'error_schema.json',
    assertions: (payload) => {
      expect(payload?.error?.code, 'Expected error code 1003').toBe(1003);
      expect(
        String(payload?.error?.message ?? '').toLowerCase(),
        'Expected error message about missing parameter',
      ).toContain('parameter q is missing');
    },
  },
  WeatherApiInvalidLocationPactTest: {
    method: 'get',
    endpoint: '/current.json',
    query: { q: 'UnknownCity12345' },
    expectedStatus: 400,
    schema: 'error_schema.json',
    assertions: (payload) => {
      expect(payload?.error?.code, 'Expected error code 1006').toBe(1006);
      expect(
        String(payload?.error?.message ?? '').toLowerCase(),
        'Expected error message about no matching location',
      ).toContain('no matching location found');
    },
  },
  WeatherApiBulkRequestPactTest: {
    method: 'post',
    endpoint: '/current.json',
    query: { q: 'bulk' },
    body: {
      locations: [
        { q: 'London', custom_id: 'l1' },
        { q: '90201', custom_id: 'z1' },
      ],
    },
    headers: { 'Content-Type': 'application/json' },
    expectedStatus: 400,
    schema: 'error_schema.json',
    assertions: (payload) => {
      expect(payload?.error?.code, 'Expected error code 2009').toBe(2009);
      expect(
        String(payload?.error?.message ?? '').toLowerCase(),
        'Expected error message to mention access restrictions',
      ).toContain('does not have access');
    },
  },
};

let weatherBaseUrl: string;
let weatherApiKey: string;
let lastContractResponse: AxiosResponse | undefined;
let lastContractDefinition: ContractDefinition | undefined;

const loadSchema = (schemaName: string) => {
  const schemaPath = path.resolve(__dirname, '../../../helper/util/schemas', schemaName);
  // const raw = fs.readFileSync(schemaPath, 'utf-8');
  const schema = require(schemaPath);
  return schema;
  // return JSON.parse(raw);
};

Given('the Weather API consumer contracts are available', function () {
  weatherBaseUrl = process.env.WEATHERAPI_BASEURL ?? 'https://api.weatherapi.com/v1';
  weatherApiKey = process.env.WEATHERAPI_KEY || '';
  expect(weatherBaseUrl, 'Weather API base URL must resolve to https').toContain('http');
});

When('I run the contract test {string}', async function (testClass: string) {
  const definition = contractDefinitions[testClass];
  expect(definition, `Unknown contract test class: ${testClass}`).toBeTruthy();

  const queryParams: Record<string, string | number | undefined> = {
    ...(definition.query ?? {}),
  };

  if (definition.includeApiKey !== false) {
    queryParams.key = weatherApiKey;
  }

  const headers = {
    Accept: 'application/json',
    ...(definition.headers ?? {}),
  };

  try {
    lastContractResponse = await APIUtils.sendRequest(
      weatherBaseUrl,
      definition.method.toUpperCase(),
      definition.endpoint,
      definition.body ?? {},
      headers,
      queryParams,
    );
  } catch (error: any) {
    if (error?.response) {
      lastContractResponse = error.response as AxiosResponse;
    } else {
      throw error;
    }
  }

  lastContractDefinition = definition;
});

Then('the contract verification should pass', function () {
  expect(lastContractDefinition, 'Contract definition was not initialised').toBeTruthy();
  expect(lastContractResponse, 'No response captured for contract verification').toBeTruthy();

  const definition = lastContractDefinition!;
  const response = lastContractResponse!;
  const payload = response.data ?? {};


  expect(response.status, `Expected status ${definition.expectedStatus}`).toBe(definition.expectedStatus);

  if (definition.schema) {
    const schema = loadSchema(definition.schema);
    const validate = validator(schema, { includeErrors: true });
    const valid = validate(payload);
    if (!valid) {
      const details = (validate.errors ?? [])
        .map((err: any) => `${err.instanceLocation ?? ''} ${err.error}`)
        .join('\n');
      expect(valid, `Schema validation failed for ${definition.schema}\n${details}`).toBe(true);
    }
  }

  if (definition.assertions) {
    definition.assertions(payload, response);
  }
});
