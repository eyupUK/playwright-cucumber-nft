# 🚀 Enhanced Performance Testing Guide

This comprehensive guide explains how to use the advanced performance testing capabilities available in this project using k6 with custom enhanced HTML reporting, interactive charts, and AI-powered insights.

## Test Types Overview

### 1. Default Performance Test
- **Purpose**: Basic performance validation
- **Configuration**: 10 VUs for 30 seconds
- **Command**: `npm run k6:local`

### 2. Load Testing
- **Purpose**: Test system under normal expected load
- **Configuration**: 
  - Ramp up to 20 users over 2 minutes
  - Maintain 20 users for 5 minutes
  - Ramp up to 50 users over 2 minutes
  - Maintain 50 users for 5 minutes
  - Ramp down to 0 users over 2 minutes
- **Commands**:
  - `npm run k6:load` - Standard load test
  - `npm run k6:load:verbose` - Load test with detailed logging
  - `npm run k6:cloud:load` - Load test on k6 Cloud
  - `npm run k6:grafana:load` - Load test with Grafana Cloud integration

### 3. Stress Testing
- **Purpose**: Test system under extreme conditions to find breaking point
- **Configuration**:
  - Gradual ramp up: 10 → 50 → 100 → 200 users
  - Extended duration with stress at 200 concurrent users
  - 10-minute ramp down period
- **Commands**:
  - `npm run k6:stress` - Standard stress test
  - `npm run k6:stress:verbose` - Stress test with detailed logging
  - `npm run k6:cloud:stress` - Stress test on k6 Cloud
  - `npm run k6:grafana:stress` - Stress test with Grafana Cloud integration

### 4. Spike Testing
- **Purpose**: Test system behavior during sudden load spikes
- **Configuration**:
  - Normal load: 10 users
  - Sudden spikes: 100 and 150 users
  - Quick recovery to normal load
- **Commands**:
  - `npm run k6:spike` - Spike test

## Test Features by Type

| Feature | Default | Load | Stress | Spike |
|---------|---------|------|--------|-------|
| Current Weather API | ✅ | ✅ | ✅ | ✅ |
| Forecast Weather API | ✅ | ✅ | ✅ | ✅ |
| History Weather API | ❌ | ✅ | ✅ | ❌ |
| Bulk Requests | ❌ | ❌ | ✅ | ❌ |
| Rate Limiting Test | ❌ | ❌ | ✅ | ❌ |
| Error Handling | ✅ | ✅ | ✅ | ✅ |
| Extended City List | ❌ | ❌ | ✅ | ❌ |

## Performance Thresholds

### Load Testing Thresholds
- 95% of requests should complete in < 2 seconds
- Less than 10% of requests should fail
- Specific scenario thresholds: < 1.5 seconds

### Stress Testing Thresholds
- 95% of requests should complete in < 5 seconds
- Less than 30% of requests should fail
- Specific scenario thresholds: < 3 seconds

### Spike Testing Thresholds
- 95% of requests should complete in < 3 seconds
- Less than 40% of requests should fail

## Environment Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `TEST_TYPE` | Type of test to run | `default` | `load`, `stress`, `spike` |
| `VERBOSE` | Enable detailed logging | `false` | `true` |
| `WEATHERAPI_BASEURL` | Weather API base URL | `https://api.weatherapi.com/v1` | Custom URL |
| `WEATHERAPI_KEY` | Weather API key | Included default | Your API key |

## Running Tests

### Local Execution
```bash
# Basic performance test
npm run k6:local

# Load testing
npm run k6:load
npm run k6:load:verbose

# Stress testing
npm run k6:stress
npm run k6:stress:verbose

# Spike testing
npm run k6:spike
```

### Cloud Execution
```bash
# k6 Cloud
npm run k6:cloud:load
npm run k6:cloud:stress

# Grafana Cloud
npm run k6:grafana:load
npm run k6:grafana:stress
```

### Generate Reports

### 🎨 Enhanced HTML Reports with Advanced Visualizations

```bash
# Generate comprehensive HTML report with interactive charts
npm run k6:report

# Open beautiful interactive report in browser
npm run open:k6-report
```

### 📊 Advanced Report Features

The enhanced k6 report system provides enterprise-grade analytics:

#### **🎯 Interactive Visualizations**
- **Response Time Distribution Charts** - Bar charts showing avg, median, percentiles
- **Performance Percentile Analysis** - Line graphs for 50th, 90th, 95th, 99th percentiles  
- **Load Distribution Radar Charts** - Performance profile comparison between test types
- **Throughput Comparison Charts** - Request/second analysis across all tests
- **Time Series Analysis** - Real-time performance over execution duration
- **Check Results Visualization** - Donut charts showing pass/fail ratios

#### **🔍 Smart analytics**
- **Test Overview Dashboard** - High-level KPIs (total requests, avg response, failure rate)
- **Multi-Test Comparison Tables** - Side-by-side analysis of Load vs Stress vs Spike
- **Threshold Analysis** - Visual pass/fail indicators with specific recommendations
- **AI-Powered Insights** - Automated bottleneck detection and optimization suggestions
- **Performance Recommendations** - Context-aware advice based on test results

#### **🎨 Modern UI Design**
- **Professional Gradient Design** - Beautiful visual presentation
- **Responsive Layout** - Perfect display on desktop, tablet, and mobile devices
- **3D Hover Effects** - Interactive card transformations and visual feedback
- **Color-Coded Status** - Intuitive green/yellow/red status indicators
- **Print-Friendly** - Optimized layouts for report printing and sharing

## Interpreting Results

### Key Metrics to Monitor

1. **Response Time**:
   - `http_req_duration`: Average response time
   - `p(95)`: 95th percentile response time
   - `p(99)`: 99th percentile response time

2. **Throughput**:
   - `http_reqs`: Total number of requests
   - `http_req_rate`: Requests per second

3. **Error Rate**:
   - `http_req_failed`: Percentage of failed requests
   - `checks`: Percentage of successful checks

4. **Resource Usage**:
   - `vus`: Virtual users count
   - `data_received`: Amount of data received
   - `data_sent`: Amount of data sent

### Success Criteria

#### Load Test Success
- All thresholds pass
- Response times remain stable
- Error rate < 10%
- System recovers quickly after test

#### Stress Test Success
- System handles increasing load gracefully
- Identifies breaking point
- Error rate acceptable up to stress point
- System recovers after stress removal

#### Spike Test Success
- System handles sudden load spikes
- Response times may increase but remain acceptable
- No system crashes
- Quick recovery to normal performance

## 🤖 CI/CD Integration & Automation

### GitHub Actions Integration

The framework includes an enhanced GitHub Actions workflow (`.github/workflows/k6-grafana.yml`) that provides:

#### **🔄 Automated Execution**
- **Scheduled runs** - Daily performance monitoring at 2 AM UTC
- **Event-triggered** - Runs on push to main/master and pull requests
- **Manual dispatch** - On-demand execution with custom parameters

#### **📊 Enhanced Reporting in CI**
- **Automatic report generation** - Custom HTML reports created in pipeline
- **Artifact management** - Performance reports uploaded for 30 days retention
- **GitHub Summary integration** - Key metrics displayed in Actions summary
- **Multi-format outputs** - JSON, HTML, and raw data files preserved

#### **⚙️ Flexible Configuration**
```yaml
# Manual workflow dispatch with custom parameters
workflow_dispatch:
  inputs:
    test_duration:
      description: 'Test duration (e.g., 30s, 5m)'
      default: '30s'
    virtual_users:
      description: 'Number of virtual users'
      default: '10'
```

#### **🚀 Advanced Features**
- **Node.js setup** - Proper dependency management with npm ci
- **k6 Cloud integration** - Automatic cloud execution for main branch
- **Error handling** - Robust failure recovery and artifact collection
- **Clean dependencies** - No external package dependencies (self-contained)

## Best Practices

1. **Test Environment**:
   - Use dedicated test environment
   - Ensure consistent network conditions
   - Monitor system resources during tests

2. **Test Data**:
   - Use realistic test data
   - Avoid production data
   - Rotate API keys if needed

3. **Test Execution**:
   - Run tests during off-peak hours
   - Execute multiple test runs for consistency
   - Document test conditions and results

4. **Result Analysis**:
   - Compare results across test runs
   - Identify performance trends
   - Set up alerts for performance degradation
   - Use enhanced HTML reports for stakeholder communication

5. **CI/CD Integration**:
   - Configure secrets for API keys and k6 Cloud tokens
   - Set up branch protection rules with performance gates
   - Monitor GitHub Actions artifacts for historical trending
   - Use performance reports in code review processes

## Troubleshooting

### Common Issues

1. **API Rate Limiting**:
   - Symptoms: 429 status codes
   - Solution: Adjust VU count or sleep times

2. **Network Timeouts**:
   - Symptoms: High response times, connection errors
   - Solution: Check network connectivity, increase thresholds

3. **Memory Issues**:
   - Symptoms: k6 crashes, system slowdown
   - Solution: Reduce VU count, optimize test script

4. **Invalid Results**:
   - Symptoms: Unexpected metrics, failed checks
   - Solution: Validate API endpoints, check test data

## 🆕 Recent Enhancements & Fixes

### ✅ **October 2025 Updates**

#### **🎨 Enhanced Reporting System**
- **Custom HTML Report Generator** - Built from scratch with Chart.js integration
- **Dependency Cleanup** - Removed problematic `k6-html-reporter` package
- **Multi-test Support** - Automatically processes Load, Stress, and Spike test results
- **Interactive Visualizations** - Professional charts with modern UI design

#### **🤖 Improved CI/CD Pipeline**
- **GitHub Actions Fix** - Resolved npm dependency installation errors
- **Enhanced Workflow** - Added Node.js setup and comprehensive reporting
- **Artifact Management** - Performance reports uploaded with 30-day retention
- **Summary Integration** - Key metrics displayed in GitHub Actions summary

#### **🔧 Technical Improvements**
- **Clean Dependencies** - Removed unnecessary and deprecated packages
- **Error Handling** - Robust parsing of k6 output with proper exception handling  
- **Modern JavaScript** - Updated Chart.js to latest version with date adapters
- **Self-contained Solution** - No external dependencies for report generation

### Getting Help

- Check [k6 documentation](https://k6.io/docs/) for official guidance
- Review test logs for detailed error information
- Use verbose mode for debugging: `-e VERBOSE=true`
- Monitor system resources during test execution
- Check GitHub Actions artifacts for historical performance reports