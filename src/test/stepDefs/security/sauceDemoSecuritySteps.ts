import { Given, Then } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { expect } from '@playwright/test';
import {
  assertHeaderEquals,
  assertHeaderPresent,
  assertHtmlBaseline,
  getHeaderValue,
  normaliseHeaders,
} from '../../../helper/security/owaspAssertions';

let sauceBaseUrl: string;
let sauceResponse: AxiosResponse<string> | undefined;
let homepageHtml: string | undefined;

const fetchHomepage = async (): Promise<AxiosResponse<string>> => {
  sauceBaseUrl = process.env.SAUCEDEMO_BASEURL ?? 'https://www.saucedemo.com/';
  expect(sauceBaseUrl, 'SauceDemo base URL must use HTTPS').toContain('https://');
  const response = await axios.get<string>(sauceBaseUrl, {
    timeout: 30_000,
    validateStatus: () => true,
    maxRedirects: 5,
  });
  return response;
};

Given('I query the SauceDemo homepage', async function () {
  sauceResponse = await fetchHomepage();
});

Then('the web response header {string} is present', function (headerName: string) {
  expect(sauceResponse, 'No response captured').toBeTruthy();
  assertHeaderPresent(normaliseHeaders(sauceResponse?.headers), headerName);
});

Then('the web response header {string} equals {string}', function (headerName: string, expected: string) {
  expect(sauceResponse, 'No response captured').toBeTruthy();
  assertHeaderEquals(normaliseHeaders(sauceResponse?.headers), headerName, expected);
});

Then(
  'the response has either {string} or a CSP {string} directive',
  function (headerName: string, directive: string) {
    expect(sauceResponse, 'No response captured').toBeTruthy();
    const headers = normaliseHeaders(sauceResponse?.headers);
    const headerValue = getHeaderValue(headers, headerName);
    const csp = getHeaderValue(headers, 'Content-Security-Policy');
    const hasHeader = typeof headerValue === 'string' && headerValue.trim().length > 0;
    const hasDirective = typeof csp === 'string' && csp.toLowerCase().includes(directive.toLowerCase());
    expect(
      hasHeader || hasDirective,
      `Expected ${headerName} header or CSP directive '${directive}'`,
    ).toBe(true);
  },
);

Then('the response meets OWASP baseline for HTTPS endpoints', function () {
  expect(sauceResponse, 'No response captured').toBeTruthy();
  assertHtmlBaseline(normaliseHeaders(sauceResponse?.headers), true);
});

Given('I fetch the SauceDemo homepage HTML', async function () {
  sauceResponse = await fetchHomepage();
  homepageHtml = sauceResponse.data;
  expect(homepageHtml, 'Homepage HTML should be non-empty').toBeTruthy();
});

Then('the page should not reference insecure http resources', function () {
  expect(homepageHtml, 'Homepage HTML not loaded').toBeTruthy();
  const lower = homepageHtml!.toLowerCase();
  expect(
    lower.includes('http://'),
    'Homepage HTML contains insecure http:// references',
  ).toBe(false);
});

Then('the CSP must not contain {string} or {string}', function (first: string, second: string) {
  expect(sauceResponse, 'No response captured').toBeTruthy();
  const csp = assertHeaderPresent(normaliseHeaders(sauceResponse?.headers), 'Content-Security-Policy');
  const lower = csp.toLowerCase();
  expect(lower.includes(first.toLowerCase()), `CSP contains disallowed directive ${first}`).toBe(false);
  expect(lower.includes(second.toLowerCase()), `CSP contains disallowed directive ${second}`).toBe(false);
});
