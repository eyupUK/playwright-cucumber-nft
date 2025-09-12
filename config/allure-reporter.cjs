function isCtor(x) {
  return typeof x === 'function';
}

function tryLoad(path) {
  try {
    const mod = require(path);
    return mod?.default ?? mod;
  } catch (_) {
    return null;
  }
}

function loadV3() {
  // v3 sometimes exports the formatter at /reporter or /dist/reporter
  return (
    tryLoad('allure-cucumberjs/reporter') ||
    tryLoad('allure-cucumberjs/dist/reporter') ||
    null
  );
}

function buildV2Like(modId) {
  try {
    const mod = require(modId);
    const { CucumberJSAllureFormatter } = mod || {};
    if (!isCtor(CucumberJSAllureFormatter)) return null;

    const { AllureRuntime } = require('allure-js-commons');

    // Return a constructor class Cucumber can new()
    return class AllureFormatter extends CucumberJSAllureFormatter {
      constructor(options) {
        const resultsDir =
          options?.parsedArgvOptions?.formatOptions?.resultsDir ||
          process.env.ALLURE_RESULTS_DIR ||
          'allure-results';
        super(options, new AllureRuntime({ resultsDir }), {});
      }
    };
  } catch (_) {
    return null;
  }
}

const MaybeCtor =
  loadV3() ||
  buildV2Like('allure-cucumberjs') ||
  buildV2Like('allure-cucumberjs2');

if (!isCtor(MaybeCtor)) {
  throw new Error(
    'Could not load an Allure Cucumber formatter. ' +
      'Install a compatible package (e.g. "npm i -D allure-cucumberjs@^3" or "allure-cucumberjs2").'
  );
}

module.exports = MaybeCtor;
