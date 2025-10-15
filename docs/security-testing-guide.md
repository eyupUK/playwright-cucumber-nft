# Security Testing Guide

This guide explains how to exercise the built-in security checks that ship with the Playwright + Cucumber + TypeScript framework. The scenarios are designed for hands-on practice with OWASP-inspired checks against public demo services.

## Available Security Suites

| Feature Set | Tags | Target | Highlights |
|-------------|------|--------|------------|
| `security/weather_api_security.feature` | `@security @api` | WeatherAPI.com | API key enforcement, injection resilience, CORS, rate limiting, security headers |
| `security/saucedemo_security.feature` | `@security @web` | https://www.saucedemo.com | Security headers, CSP hygiene, mixed-content detection |
| `security/jwt_security.feature` | `@security @jwt @api` | EscuelaJS demo API | JWT issuance, protected endpoints, tampering checks |
| `security/oauth_security.feature` | `@security @oauth @api` | Configurable OAuth provider | Client credentials flow, token inspection, opaque token verification |

Run all security scenarios with:

```bash
npm run test:security
```

> Note: The suite still honours `--tags` when passed after the script, e.g. `npm run test:security -- --tags "@web"`.

## Environment Configuration

Most checks rely on public demo endpoints. Sensitive inputs (API keys, client secrets) are pulled from environment variables. Populate them via shell exports or `.env.<env>` files consumed by `dotenv`.

### Weather API

| Variable | Purpose | Default |
|----------|---------|---------|
| `WEATHERAPI_BASEURL` | Base URL for Weather API | `https://api.weatherapi.com/v1` |
| `WEATHERAPI_KEY` | Required for scenarios tagged `@requires_key` | - |
| `RATE_LIMIT_CALLS` | Override loop count for rate-limit scenario | `50` |

### SauceDemo Security Checks

| Variable | Purpose | Default |
|----------|---------|---------|
| `SAUCEDEMO_BASEURL` | Homepage URL | `https://www.saucedemo.com/` |

### Demo JWT API

| Variable | Purpose | Default |
|----------|---------|---------|
| `DEMO_JWT_API_BASE` | EscuelaJS base URL | `https://api.escuelajs.co/api/v1` |

### OAuth 2.0 Client-Credentials Flow

| Variable | Purpose | Notes |
|----------|---------|-------|
| `OAUTH_TOKEN_URL` | Token endpoint | Required |
| `OAUTH_CLIENT_ID` | Client identifier | Required |
| `OAUTH_CLIENT_SECRET` | Client secret | Required |
| `OAUTH_SCOPE` | (Optional) requested scope | Optional |
| `OAUTH_PROBE_URL` | Protected resource to call with Bearer token | Required for probe scenario |

> **Tip:** When targeting Spotify, supply their Accounts service endpoints; the `@spotify` scenario asserts an opaque access token.

## Safety Practices

- **Keep secrets out of logs** – the steps avoid printing tokens or API keys. Ensure the same when extending tests.
- **Respect rate limits** – the Weather API loop is sequential and honours `Retry-After`. Adjust `RATE_LIMIT_CALLS` if you have a restrictive key.
- **Use HTTPS endpoints** – steps assert HTTPS-only configurations; override defaults only when demo services require it.

## Extending the Suite

- Add further OWASP checks by reusing helpers in `src/helper/security/`.
- Mix security tags with functional tags (e.g. `@security @smoke`) to wire them into CI selectively.
- For custom APIs, copy the Weather API feature as a template and swap the endpoints and assertions.

Happy hacking!
