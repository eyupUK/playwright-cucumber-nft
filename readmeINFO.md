# Playwright + Cucumber + TypeScript Test Automation Framework

A comprehensive, production-ready test automation framework combining **Playwright**, **Cucumber**, and **TypeScript** for modern web application testing. This framework supports UI testing, API testing, and performance testing with k6 integration.

## 🎯 Framework Overview

**Cucumber** enables behavior-driven development (BDD) with human-readable test scenarios that facilitate collaboration between developers, testers, and stakeholders. **TypeScript** provides static typing for improved code quality, better IDE support, and enhanced maintainability. **Playwright** offers reliable cross-browser automation with modern web standards support.

## ✨ Key Features

- 🎭 **Cross-browser testing** (Chromium, Firefox, WebKit)
- 🔄 **API & UI test automation** with unified reporting
- 📊 **Performance testing** with k6 and Grafana Cloud integration
- 🌍 **Multi-environment support** (Dev, QA, Staging, Prod)
- 📈 **Rich reporting** (Allure, HTML, JSON) with screenshots/videos
- 🚀 **Parallel execution** for faster test runs
- 🔒 **Type-safe development** with TypeScript
- 📝 **BDD approach** with Cucumber for readable test scenarios

## Prerequisites

Before setting up and running the project, ensure you have the following installed on your system:

1. **Node.js** (v16 or higher)  
   Download and install from [Node.js official website](https://nodejs.org/).

2. **npm** (comes with Node.js)  

   ```bash
    node -v
    npm -v
   ```

3. **Playwright Browsers**  

   ```bash
   npx playwright install
   ```

4. **Allure Commandline** (for generating reports)  
    Install globally using:

   ```bash
   npm install -g allure-commandline --save-dev
   npm install --save-dev @cucumber/cucumber @cucumber/messages allure-cucumberjs
   ```

5. **Git** (optional, for cloning the repository)  
   Download and install from [Git official website](https://git-scm.com/).

6. **K6**

- [k6](https://k6.io/docs/getting-started/installation/) installed on your system (`brew install k6` on Mac)
- A valid WeatherAPI key (set as an environment variable)

```BASH
brew install k6
```

---

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
- config -> Contains Cucumber options and report settings

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

4. To install the browsers

```bash
npx playwright install
```

5. To execute the tests (was by deafault set to
**staging** environment in .env.staging);

```bash
npm run test
```

6. To run a particular test, change:

```bash
  paths: [
            "src/test/features/featurename.feature"
         ]
```

7. Use tags to run a specific or collection of specs:

```bash
npm run test --tags="@cart"
```

8. Run scenarios on a specific browser, assigning **chrome** (chromium), **firefox** or **webkit** (safari) to the key browser:

```bash
BROWSER=firefox npm run test --tags="@cart"
```

if browser kept empty, the framework fetch the browser type from .env file.
If the browser is empty or unassigned in .env file, browserManager.ts will assign the default browser.

9. Rerun failed sceanarios after the test execution by

```bash
npm run test --tags="@api"
npm run test:failed
```

10. To install Allure Report:

```bash
npm install -g allure-commandline --save-dev
npm install --save-dev @cucumber/cucumber @cucumber/messages allure-cucumberjs
```

11. To generate Allure Report:

```bash
allure serve
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

## 🚀 Performance Testing with k6

### Local Performance Testing

Run k6 performance tests locally with comprehensive reporting:

```bash
# Run performance test with result exports
npm run k6:local

# Generate HTML performance report
npm run k6:report

# Open performance report in browser
npm run open:k6-report
```

### Cloud Performance Testing

#### Grafana Cloud Setup

**Steps to generate a k6 API token in Grafana Cloud:**

1. Log in to your Grafana Cloud account and select your Stack
2. Navigate to: **Testing & Synthetics → Performance → Settings**
3. In the Settings page, locate the **Access** section for Personal tokens
4. Generate or copy your personal API token
5. (Optional) Generate a Stack token if you have admin permissions

**Authentication and execution:**

```bash
# Authenticate with Grafana Cloud
k6 cloud login --token <YOUR_TOKEN>

# Run tests in Grafana Cloud
npm run k6:cloud

# Run tests locally with Grafana Cloud visualization
npm run k6:grafana
```

**CI/CD Integration:** See `.github/workflows/k6-grafana.yml` for automated performance testing.

### Advanced Performance Testing Configuration

**Customizing test parameters:**

```bash
# Run with custom parameters
WEATHERAPI_KEY=your_key WEATHERAPI_BASEURL=https://api.weatherapi.com/v1 npm run k6:local

# Environment variables supported:
# - WEATHERAPI_KEY: Your Weather API key
# - WEATHERAPI_BASEURL: API base URL
# - K6_VUS: Number of virtual users
# - K6_DURATION: Test duration
```

**Test script customization:**
- Edit `src/performance/weather-api.k6.js` to modify:
  - Virtual users (`vus`) and duration
  - Test scenarios and endpoints
  - Cities and forecast days
  - Performance thresholds

## 📁 Enhanced Folder Structure

```bash
playwright-cucumber-ts-pom/
├── .github/workflows/       # CI/CD pipelines
│   ├── playwright.yml       # UI/API testing workflow
│   └── k6-grafana.yml      # Performance testing workflow
├── config/                  # Configuration files
│   ├── cucumber.cjs         # Cucumber settings
│   └── allure-reporter.cjs  # Allure reporter config
├── src/
│   ├── helper/
│   │   ├── browsers/        # Browser management utilities
│   │   ├── env/            # Environment configurations (.env files)
│   │   ├── report/         # Report generation scripts
│   │   ├── types/          # TypeScript type definitions
│   │   ├── util/           # Utilities (API, CSV reader, Logger)
│   │   └── wrapper/        # Playwright wrapper classes
│   ├── hooks/              # Cucumber hooks and World setup
│   │   ├── hooks.ts        # Test setup/teardown logic
│   │   └── world.ts        # Custom World class
│   ├── pages/              # Page Object Model classes
│   │   └── appSauceDemo/   # SauceDemo page objects
│   ├── performance/        # k6 performance test scripts
│   │   └── weather-api.k6.js
│   └── test/
│       ├── features/       # Cucumber feature files (.feature)
│       └── stepDefs/       # Step definition implementations
├── test-results/           # Generated test reports and artifacts
├── allure-results/         # Allure test results
├── images/                 # Documentation screenshots
├── generate-k6-report.js   # k6 report generator
├── package.json            # Dependencies and npm scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project documentation
```

## 🎯 Advanced Features

### GitHub Actions Integration
- **Automated UI/API testing** on push and PR
- **Scheduled performance testing** with k6
- **Multi-environment deployment** support
- **Artifact collection** and report generation
- **Email notifications** for test results

### Enhanced Reporting System
- **Allure Reports** with timeline and trends
- **Custom k6 Performance Reports** with metrics visualization
- **Screenshot/Video capture** on test failures
- **Structured logging** with Winston
- **Multi-format outputs** (HTML, JSON, XML)

### Development Productivity
- **TypeScript IntelliSense** with custom types
- **Environment-specific configurations**
- **Parallel test execution** optimization
- **Retry mechanisms** for flaky tests
- **Hot-reload development** with watch mode

![Project Structure](images/folders.png)

## 📊 Report Samples & Screenshots

### Allure Test Reports

![Allure Overview](images/allure1.png)
*Comprehensive test overview with execution timeline*

![Allure Details](images/allure2.png)
*Detailed test results with failure analysis*

![Allure Trends](images/allure3.png)
*Historical trends and performance metrics*

### Cucumber HTML Reports

![Cucumber Report](images/cucumber-report.png)
*Standard Cucumber reporting with feature breakdown*

![Custom Cucumber Report](images/custom-cucumber-report.png)
*Enhanced custom reporting with rich formatting*

![Cucumber Details](images/custom-cucumber-report1.png)
*Detailed scenario execution with step-by-step results*

### Performance Reports

- **k6 HTML Reports** - Custom performance dashboards
- **Grafana Cloud Integration** - Real-time metrics visualization
- **Response Time Analysis** - Detailed performance breakdowns
- **Load Testing Results** - Concurrent user simulation data

## 🚀 Getting Started Quickly

### Quick Installation

```bash
# Clone and setup
git clone https://github.com/eyupUK/playwright-cucumber-ts-pom.git
cd playwright-cucumber-ts-pom
npm install
npx playwright install

# Run sample tests
npm test -- --tags="@login"
npm run k6:local && npm run k6:report
```

### Development Workflow

1. **Write feature files** in `src/test/features/`
2. **Implement step definitions** in `src/test/stepDefs/`
3. **Create page objects** in `src/pages/`
4. **Run and debug** with `npm run debug`
5. **Generate reports** with `npm run k6:report`

---

**📚 Framework Documentation**  
**🔧 Version:** 1.0.0  
**👨‍💻 Author:** EyupUK  
**📅 Last Updated:** October 2025  
**⭐ Features:** UI Testing | API Testing | Performance Testing | BDD | TypeScript
