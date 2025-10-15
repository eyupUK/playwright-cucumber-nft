import { Given, When, Then } from '@cucumber/cucumber';
import axios, { AxiosResponse } from 'axios';
import { expect } from '@playwright/test';
import {
  decodeHeader,
  decodePayload,
  isLikelyJwt,
} from '../../../helper/security/jwtUtils';
import {
  oauthClientId,
  oauthClientSecret,
  oauthProbeUrl,
  oauthScope,
  oauthTokenUrl,
} from '../../../helper/security/oauthConfig';

type JsonObject = Record<string, unknown>;

let tokenEndpoint: string | undefined;
let clientId: string | undefined;
let clientSecret: string | undefined;
let scope: string | undefined;
let probeEndpoint: string | undefined;

let accessToken: string | undefined;
let tokenType: string | undefined;
let lastResponse: AxiosResponse<JsonObject> | undefined;

const requestAccessToken = async (): Promise<AxiosResponse<JsonObject>> => {
  if (!tokenEndpoint || !clientId || !clientSecret) {
    throw new Error('OAuth client credentials must be configured before requesting a token');
  }
  const form = new URLSearchParams();
  form.append('grant_type', 'client_credentials');
  form.append('client_id', clientId);
  form.append('client_secret', clientSecret);
  if (scope) {
    form.append('scope', scope);
  }
  const response = await axios.post<JsonObject>(tokenEndpoint, form.toString(), {
    timeout: 30_000,
    validateStatus: () => true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  return response;
};

Given('OAuth 2.0 client credentials are configured', function () {
  tokenEndpoint = oauthTokenUrl();
  clientId = oauthClientId();
  clientSecret = oauthClientSecret();
  scope = oauthScope();
  probeEndpoint = oauthProbeUrl();

  expect(tokenEndpoint, 'oauth.token_url must be configured for @oauth tests').toBeTruthy();
  expect(clientId, 'oauth.client_id must be configured for @oauth tests').toBeTruthy();
  expect(clientSecret, 'oauth.client_secret must be configured for @oauth tests').toBeTruthy();
});

When('I request an OAuth access token', async function () {
  lastResponse = await requestAccessToken();
  const tokenCandidate = lastResponse.data['access_token'];
  const typeCandidate = lastResponse.data['token_type'];
  accessToken = typeof tokenCandidate === 'string' ? tokenCandidate : undefined;
  tokenType = typeof typeCandidate === 'string' ? typeCandidate : undefined;
});

Then('I receive an access token of type Bearer', function () {
  expect(lastResponse, 'No response from token endpoint').toBeTruthy();
  expect(lastResponse!.status < 400, `Unexpected status from token endpoint: ${lastResponse?.status}`).toBe(true);
  expect(accessToken, 'Missing access token in response').toBeTruthy();
  expect(tokenType, 'Missing token_type in response').toBeTruthy();
  expect(tokenType?.toLowerCase(), 'token_type must be Bearer').toBe('bearer');
});

Then('if the access token is a JWT it has a header algorithm and a JSON payload', function () {
  if (!accessToken || !isLikelyJwt(accessToken)) {
    return;
  }
  const header = decodeHeader(accessToken);
  const payload = decodePayload(accessToken);
  const alg = header.alg;
  expect(typeof alg === 'string' && alg.trim().length > 0, 'JWT header.alg should be present').toBe(true);
  expect(Object.keys(payload).length > 0, 'JWT payload should not be empty').toBe(true);
});

Then('the access token is not a JWT', function () {
  expect(accessToken, 'No access token available').toBeTruthy();
  expect(isLikelyJwt(accessToken), 'Expected opaque (non-JWT) token').toBe(false);
});

Then('the access token is not a JWT for {string}', function (provider: string) {
  expect(accessToken, 'No access token available').toBeTruthy();
  if (provider && provider.toLowerCase() === 'spotify') {
    if (!tokenEndpoint || !tokenEndpoint.toLowerCase().includes('accounts.spotify.com')) {
      console.warn('Skipping opaque token assertion because OAUTH_TOKEN_URL is not configured for Spotify');
      return;
    }
  }
  expect(isLikelyJwt(accessToken), `Expected opaque (non-JWT) token for provider ${provider}`).toBe(false);
});

Given('I have an OAuth access token', async function () {
  if (accessToken) {
    return;
  }
  lastResponse = await requestAccessToken();
  const tokenCandidate = lastResponse.data['access_token'];
  const typeCandidate = lastResponse.data['token_type'];
  accessToken = typeof tokenCandidate === 'string' ? tokenCandidate : undefined;
  tokenType = typeof typeCandidate === 'string' ? typeCandidate : undefined;
  expect(accessToken, 'Failed to obtain OAuth access token').toBeTruthy();
});

When('I call the OAuth probe endpoint with the token', async function () {
  expect(probeEndpoint, 'oauth.probe_url must be configured to call protected resource').toBeTruthy();
  expect(accessToken, 'No OAuth access token available').toBeTruthy();
  lastResponse = await axios.get<JsonObject>(probeEndpoint!, {
    timeout: 30_000,
    validateStatus: () => true,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
  });
});

Then('the response status is a successful 2xx', function () {
  expect(lastResponse, 'No probe response captured').toBeTruthy();
  const status = lastResponse!.status;
  expect(status >= 200 && status < 300, `Expected 2xx status, got ${status}`).toBe(true);
});
