# Contract Testing Guide

This framework uses [Pact](https://docs.pact.io/) to model consumer-driven contracts for the Weather API. Each Cucumber scenario tagged with `@contract` spins up a Pact mock server, executes the interaction via Playwright's axios helper, and saves the generated pact to `pacts/` for provider verification.

## Running the Suite

```bash
npm test --tags "@contract"
```

During execution you will see Pact mock servers start on ephemeral ports and pact files written to `pacts/<consumer>-<provider>.json`.

## Configuration

| Env Var | Purpose | Default |
|---------|---------|---------|
| `PACT_CONSUMER_NAME` | Consumer name recorded in pacts | `PlaywrightWeatherApiConsumer` |
| `PACT_PROVIDER_NAME` | Provider name recorded in pacts | `WeatherAPI` |
| `PACT_SAMPLE_API_KEY` | API key value stubbed in requests | `PACT-KEY-12345` |
| `PACT_LOG_LEVEL` | Pact log verbosity (`trace`, `debug`, `info`, `warn`, `error`) | `warn` |

Set variables inline when needed:

```bash
PACT_LOG_LEVEL=debug npm test --tags "@contract"
```

## Generated Contracts

- Pact files are stored under `pacts/` by default.
- Add the directory to your `.gitignore` if you prefer not to check in generated contracts.
- Publish the pacts to a broker (e.g., Pactflow) for automated provider verification.

## Extending Contracts

- Add new entries to `contractDefinitions` in `src/test/stepDefs/contract/weatherApiContractSteps.ts` to model additional interactions.
- Use Pact matchers such as `like`, `integer`, and `eachLike` to keep the consumer tests resilient to value changes.
- Validate failure flows by returning 4xx responses and asserting error payloads.

With these pieces in place, you can evolve the Weather API consumer safely while ensuring downstream providers honour the agreed contracts.
