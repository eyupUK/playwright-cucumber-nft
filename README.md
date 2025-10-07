# Playwright + Cucumber + TypeScript Framework

A comprehensive test automation framework built with **Playwright**, **Cucumber**, and **TypeScript** that supports both UI and API testing with performance testing capabilities using **k6**.

## 🚀 Features

- ✅ **API & UI Testing** - Comprehensive test coverage
- ✅ **BDD with Cucumber** - Human-readable test scenarios
- ✅ **TypeScript Support** - Type-safe test development
- ✅ **Page Object Model** - Maintainable UI test structure
- ✅ **Multi-Environment Support** - Dev, QA, Staging, Prod configurations
- ✅ **Cross-Browser Testing** - Chrome, Firefox, Safari support
- ✅ **Performance Testing** - k6 integration with Load/Stress/Spike testing
- ✅ **Enhanced Reporting** - Custom HTML reports with interactive charts & AI insights
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

**Enhanced k6 Performance Testing with Multiple Test Types:**

```bash
# Basic Performance Tests
npm run k6:local              # Default performance test (10 VUs, 30s)

# Load Testing (Normal Expected Load)
npm run k6:load               # Ramp-up load testing (20-50 VUs, 16 mins)
npm run k6:load:verbose       # Load testing with detailed logging

# Stress Testing (Breaking Point Analysis)
npm run k6:stress             # Stress testing (10-200 VUs, 37 mins)
npm run k6:stress:verbose     # Stress testing with detailed logging

# Spike Testing (Sudden Load Spikes)
npm run k6:spike              # Spike testing with sudden load increases

# Cloud Execution
npm run k6:cloud:load         # Load testing on k6 Cloud
npm run k6:cloud:stress       # Stress testing on k6 Cloud
npm run k6:grafana:load       # Load testing with Grafana Cloud
npm run k6:grafana:stress     # Stress testing with Grafana Cloud

# Enhanced Reporting
npm run k6:report             # Generate comprehensive HTML report
npm run open:k6-report        # Open interactive performance report
```

**🎨 Enhanced Report Features:**

- 📊 **Interactive Charts** - Response time distributions, percentiles, time series
- 🔄 **Test Comparison** - Side-by-side analysis of different test types  
- 🎯 **Load Distribution** - Radar charts showing performance profiles
- ✅ **Threshold Analysis** - Visual pass/fail indicators with smart recommendations
- 💡 **AI-Powered Insights** - Automated performance bottleneck detection
- 📈 **Multi-Test Support** - Processes all test results (Load, Stress, Spike)
- 🎨 **Modern UI** - Professional gradient design with 3D hover effects
- 📱 **Responsive Design** - Perfect display on desktop, tablet, and mobile
- 📋 **Comprehensive Analytics** - Test overview dashboard with key metrics

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

### Enhanced Performance Testing
- ✅ **Multi-Type Testing** - Load, Stress, and Spike testing scenarios
- ✅ **Weather API Coverage** - Comprehensive API endpoint testing
- ✅ **Advanced Load Simulation** - Up to 200 concurrent virtual users
- ✅ **Real-time Monitoring** - Response time and error rate tracking
- ✅ **Cloud Integration** - k6 Cloud and Grafana Cloud support
- ✅ **Interactive Reports** - Custom HTML reports with Chart.js visualizations
- ✅ **Automated Analysis** - AI-powered performance recommendations

## 📊 Enhanced Reporting System

The framework generates multiple types of comprehensive reports:

### 🎨 **k6 Performance Reports** (Enhanced)
- **Interactive Dashboards** - Chart.js powered visualizations
- **Multi-Test Comparison** - Load vs Stress vs Spike analysis
- **Smart Recommendations** - AI-powered performance insights
- **Modern UI Design** - Professional gradient design with responsive layout
- **Comprehensive Analytics** - Test overview, metrics, and threshold analysis

### 📈 **Traditional Reports**
1. **Allure Reports** - Interactive HTML reports with timeline, trends, and test details
2. **Cucumber HTML Reports** - Standard BDD reporting with screenshots
3. **JSON Reports** - Machine-readable test results for CI/CD integration
4. **Console Logs** - Real-time test execution feedback
5. **Winston Logs** - Structured logging with file rotation and levels

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

### 🚀 Enhanced GitHub Actions Workflows

1. **playwright.yml** - Comprehensive UI and API testing
   - Multi-environment support (dev, qa, staging, prod)
   - Cross-browser matrix testing (Chrome, Firefox, Safari)
   - Parallel execution with optimal resource usage
   - Artifact collection with test results and screenshots
   - Email notifications for failures

2. **k6-grafana.yml** - Advanced performance testing
   - **Multi-type testing** - Load, Stress, and Spike scenarios
   - **Scheduled execution** - Daily automated performance monitoring
   - **Enhanced reporting** - Custom HTML reports with interactive charts
   - **Cloud integration** - k6 Cloud and Grafana Cloud support
   - **Artifact management** - Performance reports uploaded for 30 days
   - **Summary dashboard** - GitHub Actions summary with key metrics
   - **Flexible configuration** - Manual dispatch with custom parameters

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

## 🆕 Recent Updates

### October 2025 - Major Performance Testing Enhancement

#### 🎯 **Enhanced k6 Reporting System**
- ✅ **Custom HTML Report Generator** - Built from scratch with Chart.js integration
- ✅ **Interactive Visualizations** - Response time charts, percentile analysis, radar charts
- ✅ **AI-Powered Insights** - Automated performance recommendations and bottleneck detection
- ✅ **Modern UI Design** - Professional gradient design with responsive layout
- ✅ **Multi-Test Support** - Load, Stress, and Spike test comparison

#### 🤖 **Improved CI/CD Pipeline**
- ✅ **GitHub Actions Fix** - Resolved npm dependency installation errors
- ✅ **Enhanced Workflow** - Added Node.js setup and comprehensive reporting
- ✅ **Smart Artifacts** - Performance reports uploaded with 30-day retention
- ✅ **Summary Integration** - Key metrics displayed in GitHub Actions summary

#### 🔧 **Technical Improvements**
- ✅ **Dependency Cleanup** - Removed problematic k6-html-reporter package
- ✅ **Clean Installation** - Fixed npm ci issues for CI/CD environments
- ✅ **Self-contained Solution** - No external dependencies for report generation
- ✅ **Enhanced Documentation** - Updated guides with latest features

---

**Author:** EyupUK  
**Framework Version:** 1.0.0  
**Last Updated:** October 2025
