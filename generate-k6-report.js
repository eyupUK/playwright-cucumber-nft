const generateSummaryReport = require('./node_modules/k6-html-reporter/dist/index.js').generateSummaryReport;
generateSummaryReport({
  jsonFile: 'weather-api-result.json',
  output: 'weather-api-report'
});