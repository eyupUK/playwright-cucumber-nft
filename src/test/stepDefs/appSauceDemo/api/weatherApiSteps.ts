import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { CsvDataLoader } from "../../../../helper/util/CsvDataLoader";
import { assertCurrentTypes, assertForecastDays } from '../../../../helper/util/jsonAssert';
import { validator } from '@exodus/schemasafe';
import APIUtils from "../../../../helper/util/apiUtils";


let apiKey: string;
let baseUrl: string;
let lastResponse: any;
let payload: any;


Given('I have a valid WeatherAPI key configured', async function () {
  apiKey = process.env.WEATHERAPI_KEY || process.env["WEATHERAPI_KEY"] || (process as any).env.WEATHERAPI_KEY || "31ea33c30d254920977133231250909";
  if (apiKey == null || apiKey.trim() === "") {
    throw new Error("Set WEATHERAPI_KEY as env or -D system property");
  }
  baseUrl = process.env.WEATHERAPI_BASEURL || "http://api.weatherapi.com/v1";
});

// current.json

When('I request current weather for {string}', async function (query) {
  lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/current.json", {}, { "Accept": "application/json" }, { key: apiKey, q: query });
  expect(lastResponse.status).toBe(200);
  payload = await lastResponse.data;
});

Then('the payload has valid current weather types', async function () {
  assertCurrentTypes(payload);
});

Then('the response matches schema {string}', async function (schemaPath) {
  const schema = require(`../../../../helper/util/schemas/${schemaPath}`);
  const validate = validator(schema, { includeErrors: true });
  const valid = validate(payload);
  if (!valid) {
    console.error(validate.errors);
    throw new Error("Response does not match schema");
  }

});

Then('the {string} equals {string} if provided', async function (actualDataPath, expectedData) {
  if (expectedData) {
    const actualValue = actualDataPath.split('.').reduce((obj: any, key: string) => obj && obj[key], payload);
    expect(actualValue).toBe(expectedData);
  }
  else {
    throw new Error(`Skipping check for ${actualDataPath} as expected data is not provided`);
  }
});

Given('test cities are loaded from {string}', async function (filePath) {
  const cities = CsvDataLoader.load(filePath);
  expect(cities.length).toBeGreaterThan(0);
});

When('I request current weather for each city in {string}', async function (csvFile) {
  const cities = CsvDataLoader.load(csvFile);
  for (const city of cities) {
    lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/current.json", {}, { "Accept": "application/json" }, { key: apiKey, q: city.query });
    payload = await lastResponse.data;
    expect(lastResponse.status).toBe(200);
  }
});

Then('the response status is {int}', async function (status) {
  expect(lastResponse.status).toBe(status);
});

When('I POST a bulk current request', async function () {
  const body = {
    locations: [
      { q: "London", custom_id: "l1" },
      { q: "90201", custom_id: "z1" }
    ]
  };

  try {
    lastResponse = await APIUtils.sendRequest(baseUrl, "post", "/current.json", body, { "Accept": "application/json" }, { key: apiKey, q: "bulk" });
    payload = await lastResponse.data;
  } catch (error: any) {
    // Handle the error response
    if (error.response) {
      lastResponse = error.response; // Extract the response from the error
      payload = lastResponse.data;  // Extract the payload from the response
    } else {
      throw error; // Re-throw if it's not an Axios error
    }
  }
});

Then('the error code is {int} and message contains {string}', async function (errCode, errMsg) {
  expect(payload.error.code).toBe(errCode);
  expect(payload.error.message).toContain(errMsg);
});

When('I request current weather for an unknown location', async function () {
  try {
    lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/current.json", {}, { "Accept": "application/json" }, { key: apiKey, q: "UnknownLocation" });
    payload = await lastResponse.data;
  } catch (error: any) {
    // Handle the error response
    if (error.response) {
      lastResponse = error.response; // Extract the response from the error
      payload = lastResponse.data;  // Extract the payload from the response
    } else {
      throw error; // Re-throw if it's not an Axios error
    }
  }
});

When('I request current weather with no query parameter', async function () {
  try {
    lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/current.json", {}, { "Accept": "application/json" }, { key: apiKey });
    payload = await lastResponse.data;
  } catch (error: any) {
    // Handle the error response
    if (error.response) {
      lastResponse = error.response; // Extract the response from the error
      payload = lastResponse.data;  // Extract the payload from the response
    } else {
      throw error; // Re-throw if it's not an Axios error
    }
  }
});

When('I request a {int}-day forecast for {string}', async function (days: number, query: string) {
  const safeDays: number = Math.max(1, Math.min(14, days));
  lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/forecast.json", {}, { "Accept": "application/json" }, { key: apiKey, q: query, days: safeDays });
  payload = await lastResponse.data;
});

Then('the payload contains exactly the requested number of forecast days', async function () {
  assertForecastDays(payload, payload.forecast.forecastday.length);
});

When('I request a forecast for each city in {string}', async function (string) {
  const cities = CsvDataLoader.load(string);
  for (const city of cities) {
    lastResponse = await APIUtils.sendRequest(baseUrl, "get", "/forecast.json", {}, { "Accept": "application/json" }, { key: apiKey, q: city.query });
    payload = await lastResponse.data;
    expect(lastResponse.status).toBe(200);
  }
});