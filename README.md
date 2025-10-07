# Playwright + Cucumber + TypeScript Framework

A comprehensive test automation framework built with **Playwright**, **Cucumber**, and **TypeScript** that supports both UI and API testing with performance testing capabilities using **k6**.

## 🚀 Features

- ✅ **API & UI Testing** - Comprehensive test coverage
- ✅ **BDD with Cucumber** - Human-readable test scenarios
- ✅ **TypeScript Support** - Type-safe test development
- ✅ **Page Object Model** - Maintainable UI test structure
- ✅ **Multi-Environment Support** - Dev, QA, Staging, Prod configurations
- ✅ **Cross-Browser Testing** - Chrome, Firefox, Safari support
- ✅ **Performance Testing** - k6 integration with Grafana Cloud
- ✅ **Rich Reporting** - Allure, HTML, JSON reports with screenshots/videos
- ✅ **Parallel Execution** - Faster test execution
- ✅ **CI/CD Integration** - GitHub Actions workflows
- ✅ **Error Handling & Logging** - Winston logging with rotation
- ✅ **Data-Driven Testing** - CSV/JSON test data support

## 📋 Prerequisites

Before setting up the project, ensure you have:

1. **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **k6** (for performance testing) - `brew install k6` on macOS

## 🛠️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/eyupUK/playwright-cucumber-ts-pom.git
   cd playwright-cucumber-ts-pom
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright browsers:**
   ```bash
   npx playwright install
   ```

4. **Install Allure (optional, for enhanced reporting):**
   ```bash
   npm install -g allure-commandline
   ```

## 🏃‍♂️ Quick Start

### Running Tests

```bash
# Run all tests (default: staging environment)
npm test

# Run tests on specific environment
npm run test:qa
npm run test:prod
npm run test:local

# Run tests with specific tags
npm test -- --tags="@ui"
npm test -- --tags="@api"
npm test -- --tags="@login"

# Run tests on specific browser
BROWSER=firefox npm test
BROWSER=webkit npm test

# Run tests in parallel
PARALLEL=4 npm test

# Run tests in headed mode
HEAD=true npm test

# Debug mode
npm run debug
```

### Performance Testing

```bash
# Run k6 performance tests locally
npm run k6:local

# Run k6 tests in Grafana Cloud
npm run k6:cloud

# Run k6 tests with Grafana Cloud visualization
npm run k6:grafana

# Generate performance report
npm run k6:report

# Open performance report
npm run open:k6-report
```

### Other Commands

```bash
# Rerun failed tests
npm run test:failed

# Clean all generated files
npm run clean
```

## 📁 Project Structure

```
playwright-cucumber-ts-pom/
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
│       ├── playwright.yml   # UI/API test workflow
│       └── k6-grafana.yml   # Performance test workflow
├── config/
│   ├── cucumber.cjs         # Cucumber configuration
│   └── allure-reporter.cjs  # Allure reporter config
├── src/
│   ├── helper/
│   │   ├── browsers/        # Browser management
│   │   ├── env/            # Environment configurations
│   │   ├── report/         # Report generation
│   │   ├── types/          # TypeScript type definitions
│   │   ├── util/           # Utilities (API, CSV, Logger)
│   │   └── wrapper/        # Playwright wrapper
│   ├── hooks/              # Cucumber hooks & World setup
│   ├── pages/              # Page Object Model classes
│   ├── performance/        # k6 performance test scripts
│   └── test/
│       ├── features/       # Cucumber feature files
│       └── stepDefs/       # Step definition files
├── test-results/           # Test execution results
├── images/                 # Documentation images
├── package.json           # Project dependencies & scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🧪 Test Implementation Examples

### API Testing (WeatherAPI)
- ✅ GET current weather endpoint
- ✅ GET forecast endpoint  
- ✅ POST bulk requests
- ✅ Error handling (400, 401, etc.)
- ✅ Schema validation
- ✅ Data parameterization from CSV

### UI Testing (SauceDemo)
- ✅ Login scenarios (valid/invalid)
- ✅ Product catalog navigation
- ✅ Shopping cart functionality
- ✅ Checkout process
- ✅ Product sorting
- ✅ Cross-browser compatibility

### Performance Testing
- ✅ Weather API load testing
- ✅ Multiple virtual users simulation
- ✅ Response time monitoring
- ✅ Error rate tracking
- ✅ Grafana Cloud integration

## 📊 Reporting

The framework generates multiple types of reports:

1. **Allure Reports** - Interactive HTML reports with timeline, trends, and test details
2. **Cucumber HTML Reports** - Standard Cucumber reporting
3. **JSON Reports** - Machine-readable test results
4. **k6 Performance Reports** - Custom HTML performance reports
5. **Console Logs** - Real-time test execution logs
6. **Winston Logs** - Structured logging with file rotation

### Viewing Reports

```bash
# Open Allure report
allure serve allure-results

# View Cucumber HTML report
open test-results/cucumber-report.html

# View k6 performance report
npm run open:k6-report
```

## 🌍 Environment Configuration

The framework supports multiple environments through `.env` files:

- `.env.local` - Local development
- `.env.dev` - Development environment
- `.env.qa` - QA environment
- `.env.staging` - Staging environment
- `.env.prod` - Production environment

### Environment Variables

```bash
BROWSER=chromium          # Browser choice (chromium/firefox/webkit)
BASEURL=https://...       # Application base URL
HEAD=false               # Headless mode (true/false)
WEATHERAPI_KEY=...       # Weather API key
PARALLEL=2               # Parallel execution threads
```

## 🔧 Configuration

### Cucumber Configuration
Located in `config/cucumber.cjs` with support for:
- Multiple output formats
- Parallel execution
- Tag-based filtering
- Retry logic
- Custom timeouts

### TypeScript Configuration
Optimized `tsconfig.json` with:
- Strict type checking
- Path mapping
- ES2022 target
- DOM library support

## 🚀 CI/CD Integration

### GitHub Actions Workflows

1. **playwright.yml** - Runs UI and API tests
   - Multi-environment support
   - Cross-browser testing
   - Artifact collection
   - Email notifications

2. **k6-grafana.yml** - Performance testing
   - Scheduled daily runs
   - Grafana Cloud integration
   - Performance trending

### Running in CI

Tests automatically run on:
- Push to main/master branches
- Pull requests
- Scheduled cron jobs
- Manual workflow dispatch

## 🎯 Best Practices Implemented

- ✅ **Page Object Model** - Maintainable UI test structure
- ✅ **Custom World Class** - Shared context management
- ✅ **Environment Abstraction** - Easy configuration switching
- ✅ **Error Handling** - Graceful failure management
- ✅ **Logging Strategy** - Structured logging with Winston
- ✅ **Type Safety** - Full TypeScript implementation
- ✅ **Parallel Execution** - Optimized test performance
- ✅ **Retry Mechanisms** - Flaky test mitigation
- ✅ **Screenshot/Video Capture** - Visual debugging
- ✅ **Schema Validation** - API response validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -m 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙋‍♂️ Support

For questions or issues:
- Create an issue in the repository
- Check existing documentation
- Review test examples in the codebase

---

**Author:** EyupUK  
**Framework Version:** 1.0.0  
**Last Updated:** October 2025
