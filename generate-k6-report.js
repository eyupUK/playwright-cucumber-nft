const fs = require('fs');
const path = require('path');

// Function to generate a simple HTML report from k6 results
function generateK6Report() {
  try {
    // Check which result files exist
    const summaryFile = 'k6-results.json';
    const rawFile = 'k6-raw-results.json';
    
    let data = null;
    let dataSource = '';
    
    if (fs.existsSync(summaryFile)) {
      data = JSON.parse(fs.readFileSync(summaryFile, 'utf8'));
      dataSource = 'Summary';
    } else if (fs.existsSync(rawFile)) {
      console.log('Summary file not found, parsing raw results...');
      // For now, just indicate raw data exists
      dataSource = 'Raw data available but not parsed';
    } else {
      throw new Error('No k6 result files found. Run k6:local first.');
    }
    
    // Generate simple HTML report
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>k6 Performance Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: #663399; color: white; padding: 20px; border-radius: 5px; }
        .metric { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .error { color: #dc3545; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>k6 Performance Test Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Data Source: ${dataSource}</p>
    </div>
    
    ${data && data.metrics ? generateMetricsTable(data.metrics) : '<p>No metrics data available</p>'}
    
    ${data && data.checks ? generateChecksTable(data.checks) : '<p>No checks data available</p>'}
    
    <div class="metric">
        <h3>Files Generated</h3>
        <ul>
            <li>${summaryFile} - ${fs.existsSync(summaryFile) ? '✅ Available' : '❌ Missing'}</li>
            <li>${rawFile} - ${fs.existsSync(rawFile) ? '✅ Available' : '❌ Missing'}</li>
        </ul>
    </div>
</body>
</html>`;
    
    fs.writeFileSync('k6-performance-report.html', htmlContent);
    console.log('✅ K6 report generated: k6-performance-report.html');
    
  } catch (error) {
    console.error('❌ Error generating k6 report:', error.message);
    process.exit(1);
  }
}

function generateMetricsTable(metrics) {
  let html = '<h2>Metrics</h2><table><tr><th>Metric</th><th>Value</th><th>Status</th></tr>';
  
  for (const [key, metric] of Object.entries(metrics)) {
    if (metric && typeof metric === 'object' && metric.value !== undefined) {
      const status = getMetricStatus(key, metric.value);
      html += `<tr><td>${key}</td><td>${formatValue(key, metric.value)}</td><td class="${status.class}">${status.text}</td></tr>`;
    }
  }
  
  html += '</table>';
  return html;
}

function generateChecksTable(checks) {
  let html = '<h2>Checks</h2><table><tr><th>Check</th><th>Passes</th><th>Fails</th><th>Success Rate</th></tr>';
  
  for (const [key, check] of Object.entries(checks)) {
    if (check && typeof check === 'object') {
      const total = (check.passes || 0) + (check.fails || 0);
      const successRate = total > 0 ? ((check.passes || 0) / total * 100).toFixed(2) : '0';
      const statusClass = (check.fails || 0) === 0 ? 'success' : 'error';
      
      html += `<tr><td>${key}</td><td>${check.passes || 0}</td><td>${check.fails || 0}</td><td class="${statusClass}">${successRate}%</td></tr>`;
    }
  }
  
  html += '</table>';
  return html;
}

function formatValue(key, value) {
  if (key.includes('duration')) {
    return `${value.toFixed(2)}ms`;
  }
  if (key.includes('rate') || key.includes('failed')) {
    return `${(value * 100).toFixed(2)}%`;
  }
  return typeof value === 'number' ? value.toFixed(2) : value;
}

function getMetricStatus(key, value) {
  if (key.includes('failed') && value > 0.01) {
    return { class: 'error', text: 'High failure rate' };
  }
  if (key.includes('duration') && value > 1000) {
    return { class: 'warning', text: 'Slow response' };
  }
  return { class: 'success', text: 'OK' };
}

generateK6Report();