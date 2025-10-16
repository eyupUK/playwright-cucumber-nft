import { Given, When, Then } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { expect } from '@playwright/test';
import { PactV3, SpecificationVersion, MatchersV3 } from '@pact-foundation/pact';
import path from 'node:path';

const { like, integer, eachLike } = MatchersV3;

type HttpMethod = 'GET' | 'POST';

type ContractDefinition = {
  description: string;
  state?: string;
  request: {
    method: HttpMethod;
    path: string;
    query?: Record<string, string>;
    headers?: Record<string, string>;
    body?: unknown;
  };
  response: {
    status: number;
    headers?: Record<string, string>;
    body?: unknown;
  };
  assert?: (response: AxiosResponse) => void;
};

const consumerName = process.env.PACT_CONSUMER_NAME ?? 'PlaywrightWeatherApiConsumer';
const providerName = process.env.PACT_PROVIDER_NAME ?? 'WeatherAPI';
const sampleApiKey = process.env.PACT_SAMPLE_API_KEY ?? 'PACT-KEY-12345';

const jsonHeaders = { 'Content-Type': 'application/json', Accept: 'application/json' };
const allowedLogLevels = ['trace', 'debug', 'info', 'warn', 'error'] as const;
type PactLogLevel = (typeof allowedLogLevels)[number];

const resolveLogLevel = (value?: string | null): PactLogLevel =>
  allowedLogLevels.includes(value as PactLogLevel) ? (value as PactLogLevel) : 'warn';

const contractDefinitions: Record<string, ContractDefinition> = {
  WeatherApiConsumerPactTest: {
    state: 'weather data exists for London',
    description: 'a request for current weather in London',
    request: {
      method: 'GET',
      path: '/v1/current.json',
      query: { q: 'London', key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 200,
      headers: jsonHeaders,
      body: {
        location: {
          name: like('London'),
          country: like('United Kingdom'),
          lat: like(51.5074),
          lon: like(-0.1278),
        },
        current: {
          temp_c: like(15.5),
          last_updated_epoch: integer(1609459200),
          condition: {
            text: like('Partly cloudy'),
            icon: like('//cdn.weatherapi.com/weather/64x64/day/116.png'),
          },
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(200);
      expect(response.data.location.name).toBe('London');
      expect(response.data.current.temp_c).toBeDefined();
    },
  },
  WeatherApiCoordinatesPactTest: {
    state: 'weather data exists for coordinates',
    description: 'a request for current weather by coordinates',
    request: {
      method: 'GET',
      path: '/v1/current.json',
      query: { q: '48.8567,2.3508', key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 200,
      headers: jsonHeaders,
      body: {
        location: {
          name: like('Paris'),
          country: like('France'),
          lat: like(48.8567),
          lon: like(2.3508),
        },
        current: {
          temp_c: like(18.2),
          last_updated_epoch: integer(1609459200),
          condition: {
            text: like('Clear'),
            icon: like('//cdn.weatherapi.com/weather/64x64/day/113.png'),
          },
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(200);
      expect(String(response.data.location.country)).toBe('France');
    },
  },
  WeatherApiZipCodePactTest: {
    state: 'weather data exists for zip code',
    description: 'a request for current weather by zip code',
    request: {
      method: 'GET',
      path: '/v1/current.json',
      query: { q: '90201', key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 200,
      headers: jsonHeaders,
      body: {
        location: {
          name: like('Bell Gardens'),
          country: like('USA'),
          lat: like(33.9653),
          lon: like(-118.1517),
        },
        current: {
          temp_c: like(22.0),
          last_updated_epoch: integer(1609459200),
          condition: {
            text: like('Sunny'),
            icon: like('//cdn.weatherapi.com/weather/64x64/day/113.png'),
          },
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(200);
      expect(String(response.data.location.name)).toContain('Bell');
    },
  },
  WeatherApiForecastPactTest: {
    state: 'forecast data exists for London',
    description: 'a request for 3-day weather forecast',
    request: {
      method: 'GET',
      path: '/v1/forecast.json',
      query: { q: 'London', days: '3', key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 200,
      headers: jsonHeaders,
      body: {
        location: {
          name: like('London'),
          country: like('United Kingdom'),
          lat: like(51.5074),
          lon: like(-0.1278),
        },
        forecast: {
          forecastday: eachLike(
            {
              date: like('2023-01-01'),
              day: {
                maxtemp_c: like(12.5),
                mintemp_c: like(5.2),
              },
            },
            3,
          ),
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.forecast.forecastday)).toBe(true);
      expect(response.data.forecast.forecastday.length).toBeGreaterThanOrEqual(3);
    },
  },
  WeatherApiErrorsPactTest: {
    state: 'request is missing the q parameter',
    description: 'a request with missing q parameter',
    request: {
      method: 'GET',
      path: '/v1/current.json',
      query: { key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 400,
      headers: jsonHeaders,
      body: {
        error: {
          code: integer(1003),
          message: like('Parameter q is missing.'),
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe(1003);
    },
  },
  WeatherApiInvalidLocationPactTest: {
    state: 'invalid location provided',
    description: 'a request for unknown location',
    request: {
      method: 'GET',
      path: '/v1/current.json',
      query: { q: 'UnknownCity12345', key: sampleApiKey },
      headers: { Accept: 'application/json' },
    },
    response: {
      status: 400,
      headers: jsonHeaders,
      body: {
        error: {
          code: integer(1006),
          message: like("No location found matching parameter 'q'."),
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe(1006);
    },
  },
  WeatherApiBulkRequestPactTest: {
    state: 'bulk request on free plan',
    description: 'a POST request for bulk current weather',
    request: {
      method: 'POST',
      path: '/v1/current.json',
      query: { q: 'bulk', key: sampleApiKey },
      headers: jsonHeaders,
      body: {
        locations: [
          { q: 'London', custom_id: 'l1' },
          { q: '90201', custom_id: 'z1' },
        ],
      },
    },
    response: {
      status: 400,
      headers: jsonHeaders,
      body: {
        error: {
          code: integer(2009),
          message: like('API key does not have access to the resource. Please check your plan and billing details.'),
        },
      },
    },
    assert: (response) => {
      expect(response.status).toBe(400);
      expect(response.data.error.code).toBe(2009);
    },
  },
};

let lastResponse: AxiosResponse | undefined;
let lastDefinition: ContractDefinition | undefined;

Given('the Weather API consumer contracts are available', function () {
  // This step can be used to set up any preconditions if needed
  expect(Object.keys(contractDefinitions).length).toBeGreaterThan(0);
});

When('I run the contract test {string}', async function (testClass: string) {
  const definition = contractDefinitions[testClass];
  expect(definition, `Unknown contract test class: ${testClass}`).toBeTruthy();

  const pact = new PactV3({
    consumer: consumerName,
    provider: providerName,
    dir: path.resolve(process.cwd(), 'pacts'),
    logLevel: resolveLogLevel(process.env.PACT_LOG_LEVEL),
    spec: SpecificationVersion.SPECIFICATION_VERSION_V3,
  });

  const loggableInteraction = definition.state ? pact.given(definition.state) : pact;

  loggableInteraction
    .uponReceiving(definition.description)
    .withRequest({
      method: definition.request.method,
      path: definition.request.path,
      query: definition.request.query,
      headers: definition.request.headers,
      body: definition.request.body,
    })
    .willRespondWith({
      status: definition.response.status,
      headers: definition.response.headers,
      body: definition.response.body,
    });

  lastResponse = await pact.executeTest(async (mockServer) => {
    return axios({
      method: definition.request.method,
      url: `${mockServer.url}${definition.request.path}`,
      params: definition.request.query,
      headers: definition.request.headers,
      data: definition.request.body,
      validateStatus: () => true,
    });
  });

  lastDefinition = definition;
});

Then('the contract verification should pass', function () {
  expect(lastDefinition, 'Contract definition not initialised').toBeTruthy();
  expect(lastResponse, 'No response captured for contract verification').toBeTruthy();

  const definition = lastDefinition!;
  const response = lastResponse!;

  expect(response.status, 'Unexpected HTTP status from Pact mock server').toBe(definition.response.status);

  if (definition.assert) {
    definition.assert(response);
  }
});
