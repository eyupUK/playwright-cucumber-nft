# Playwright + Cucumber + TS

Cucumber is a popular behavior-driven development (BDD) tool that allows developers and stakeholders to collaborate on defining and testing application requirements in a human-readable format. 
TypeScript is a powerful superset of JavaScript that adds optional static typing, making it easier to catch errors before runtime. By combining these two tools, we can create more reliable and maintainable tests.

## Features

1. Awesome report with screenshots, videos & logs
2. Execute tests on multiple environments 
3. Parallel execution
4. Rerun only failed features
5. Retry failed tests on CI of flaky tests
6. Github Actions integrated with downloadable report
7. Page object model
8. Cross-browser testing


## Project structure

- .github -> yml file to execute the tests in GitHub Actions
- src -> Contains all the features & Typescript code
- test-results -> Contains all the reports related file

## Reports

1. [Mutilple Cucumber Report](https://github.com/WasiqB/multiple-cucumber-html-reporter)
2. Default Cucumber report
3. [Logs](https://www.npmjs.com/package/winston)
4. Screenshots of failure
5. Test videos of failure
6. Trace of failure

## Get Started

### Setup:

1. Clone or download the project
2. Extract and open in the VS-Code
3. to install the dependencies
```bash
npm i
```
4.  to install the browsers
```bash
npx playwright install
```
5. to execute the tests (was by deafault set to **staging** environment in .env.staging);
```bash
npm run test
``` 
6. To run a particular test, change:  
```
  paths: [
            "src/test/features/featurename.feature"
         ] 
```
7. Use tags to run a specific or collection of specs:
```bash
npm run test --tags="@cart"
```
8. Run scenarios on a specific browser, assigning chromium, firefox or webkit(safari) to the key browser:
```bash
BROWSER=firefox npm run test --tags="cart"
```
if browser kept empty, the framework fetch the browser type from .env file.
If the browser is empty or unassigned in .env file, browserManager.ts will assign the default browser.

9. Rerun failed sceanarios after the test execution by
```bash
npm run test --tags="api"
npm run test:failed
```

10. To install Allure Report:
```bash
npm install -g allure-commandline --save-dev
npm install --save-dev @cucumber/cucumber @cucumber/messages allure-cucumberjs
```

11. To generate Allure Report:
```bash
allure serve allure-results
```
12. To run parallel:
```bash
PARALLEL=<numberOfThread> npm run test
```
13. To run tests in headless mode:
```bash
HEAD=false npm run test
```
14. To execute tests by custom environment settings, use custom scripts relying on .env files, like:
```bash
npm run test:qa
```
![env](images/env.png)


### Folder structure
0. `src\pages` -> All the page (UI screen)
1. `src\test\features` -> write your features here
2. `src\test\stepDefs` -> Your step definitions goes here
3. `src\hooks\hooks.ts` -> Browser setup and teardown logic
4. `src\hooks\pageFixture.ts` -> Simple way to share the page objects to steps
5. `src\helper\env` -> Multiple environments are handled
6. `src\helper\types` -> To get environment code suggestions
7. `src\helper\report` -> To generate the report
8. `config/cucumber.js` -> Manages Cucumber options and reports
9. `package.json` -> Contains all the dependencies
10. `src\helper\util` -> Read test data from json & logger

**Bonus:** Integrated to GitHub Actions


## Folder Structure

```
Playwright-Cucumber-TS
├── .github
│   └── workflows
│       └── ci.yml
├── allure-results
├── src
│   ├── pages
│   │   └── examplePage.ts
│   ├── test
│   │   ├── features
│   │   │   └── example.feature
│   │   ├── stepDefs
│   │   │   └── exampleSteps.ts
│   ├── hooks
│   │   ├── hooks.ts
│   │   └── pageFixture.ts
│   ├── helper
│   │   ├── browsers
│   │   │   └── browserManager.ts
│   │   ├── env
│   │   │   ├── .env.dev
│   │   │   └── .env.test
│   │   │   └── .env.staging
│   │   ├── types
│   │   │   └── types.ts
│   │   ├── report
│   │   │   └── reportGenerator.ts
│   │   │   └── init.ts
│   │   ├── util
│   │       └── test-data
│   │           └── data.csv
│   │   │   └── schemas
│   │           └── schema.json
│   │   │   └── apiUtils.ts
│   │   │   └── csvLoader.ts.ts
│   │   │   └── logger.ts
│   │   ├── wrapper
│   │   │   └── wrapper.ts
│   │   ├── browsers
│   │   │   └── browserManager.ts
├── config
│   └── cucumber.js
│   └── allure-reporter.cjs
├── test-results
│   └── cucumber-report.html
│   └── cucumber-report.json
│   └── screenshots
│   └── videos
│   └── logs
│   └── trace
├── package.json
└── README.md
```
![folders](images/folders.png)

## Reports Samples

![Report1](images/allure1.png)

![Report2](images/allure2.png)

![Report2](images/allure2.png)

![cucumber](images/cucumber-report.png)

![cucumber0](images/custom-cucumber-report.png)

![cucumber1](images/custom-cucumber-report1.png)

