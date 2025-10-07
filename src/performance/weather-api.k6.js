import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Default performance test configuration
const defaultOptions = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
        http_req_failed: ['rate<0.5'], // allow up to 50% failures for debugging
    },
};

// Load Testing Configuration - Tests normal expected load
const loadTestOptions = {
    stages: [
        { duration: '2m', target: 20 }, // Ramp up to 20 users over 2 minutes
        { duration: '5m', target: 20 }, // Maintain 20 users for 5 minutes
        { duration: '2m', target: 50 }, // Ramp up to 50 users over 2 minutes
        { duration: '5m', target: 50 }, // Maintain 50 users for 5 minutes
        { duration: '2m', target: 0 },  // Ramp down to 0 users over 2 minutes
    ],
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
        http_req_failed: ['rate<0.1'],     // Less than 10% of requests should fail
        'http_req_duration{scenario:load}': ['p(95)<1500'],
    },
};

// Stress Testing Configuration - Tests system under extreme conditions
const stressTestOptions = {
    stages: [
        { duration: '2m', target: 10 },   // Ramp up to 10 users
        { duration: '5m', target: 10 },   // Maintain 10 users
        { duration: '2m', target: 50 },   // Ramp up to 50 users
        { duration: '5m', target: 50 },   // Maintain 50 users
        { duration: '2m', target: 100 },  // Ramp up to 100 users
        { duration: '5m', target: 100 },  // Maintain 100 users
        { duration: '2m', target: 200 },  // Ramp up to 200 users (stress point)
        { duration: '5m', target: 200 },  // Maintain 200 users
        { duration: '10m', target: 0 },   // Ramp down to 0 users
    ],
    thresholds: {
        http_req_duration: ['p(95)<5000'], // 95% of requests should be below 5s
        http_req_failed: ['rate<0.3'],     // Less than 30% of requests should fail
        'http_req_duration{scenario:stress}': ['p(95)<3000'],
    },
};

// Spike Testing Configuration - Tests sudden load spikes
const spikeTestOptions = {
    stages: [
        { duration: '1m', target: 10 },   // Normal load
        { duration: '30s', target: 100 }, // Sudden spike
        { duration: '1m', target: 10 },   // Back to normal
        { duration: '30s', target: 150 }, // Another spike
        { duration: '1m', target: 10 },   // Back to normal
        { duration: '2m', target: 0 },    // Ramp down
    ],
    thresholds: {
        http_req_duration: ['p(95)<3000'], // 95% of requests should be below 3s
        http_req_failed: ['rate<0.4'],     // Less than 40% of requests should fail
    },
};

// Determine which test configuration to use based on environment variable
const TEST_TYPE = __ENV.TEST_TYPE || 'default';

export const options = (() => {
    switch (TEST_TYPE.toLowerCase()) {
        case 'load':
            console.log('Running LOAD test configuration');
            return loadTestOptions;
        case 'stress':
            console.log('Running STRESS test configuration');
            return stressTestOptions;
        case 'spike':
            console.log('Running SPIKE test configuration');
            return spikeTestOptions;
        default:
            console.log('Running DEFAULT test configuration');
            return defaultOptions;
    }
})();

const BASE_URL = __ENV.WEATHERAPI_BASEURL || 'https://api.weatherapi.com/v1';
const API_KEY = __ENV.WEATHERAPI_KEY || '31ea33c30d254920977133231250909';

const cities = ['London', 'New York', 'Tokyo', 'Sydney', 'Berlin', 'Istanbul', 'Paris', 'Moscow', 'Madrid', 'Rome', 'Amsterdam', 'Vienna'];
const forecastDays = [1, 3, 5, 7, 10];

// Extended test data for stress testing
const stressCities = [
    'London', 'New York', 'Tokyo', 'Sydney', 'Berlin', 'Istanbul', 'Paris', 'Moscow',
    'Madrid', 'Rome', 'Amsterdam', 'Vienna', 'Stockholm', 'Copenhagen', 'Oslo',
    'Helsinki', 'Warsaw', 'Prague', 'Budapest', 'Zurich', 'Brussels', 'Dublin',
    'Edinburgh', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow', 'Cardiff',
    'Belfast', 'York', 'Bath', 'Cambridge', 'Oxford', 'Brighton', 'Bristol'
];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function getTestData() {
    const testType = __ENV.TEST_TYPE || 'default';
    return {
        cities: testType === 'stress' ? stressCities : cities,
        days: forecastDays
    };
}

// Performance metrics tracking
function trackPerformance(testName, response) {
    const metrics = {
        duration: response.timings.duration,
        size: response.body.length,
        status: response.status
    };
    
    if (testName && __ENV.VERBOSE === 'true') {
        console.log(`${testName} - Duration: ${metrics.duration}ms, Size: ${metrics.size}bytes, Status: ${metrics.status}`);
    }
    
    return metrics;
}

export default function () {
    const testData = getTestData();
    const city = getRandomItem(testData.cities);
    const days = getRandomItem(testData.days);
    const testType = __ENV.TEST_TYPE || 'default';

    // Adjust sleep time based on test type
    const sleepTime = getSleepTime(testType);

    group('Current Weather API', function () {
        let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`);
        trackPerformance('Current Weather', res);
        
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time < 2s': (r) => r.timings.duration < 2000,
            'has location': (r) => r.status === 200 && JSON.parse(r.body).location !== undefined,
            'has current weather': (r) => r.status === 200 && JSON.parse(r.body).current !== undefined,
        });
        
        check(res, {
            'no error in response': (r) => !r.body.includes('error'),
            'response size > 0': (r) => r.body.length > 0,
        });
    });

    group('Forecast Weather API', function () {
        let res = http.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}`);
        trackPerformance('Forecast Weather', res);
        
        check(res, {
            'status is 200': (r) => r.status === 200,
            'response time < 3s': (r) => r.timings.duration < 3000,
            'has forecast': (r) => r.status === 200 && JSON.parse(r.body).forecast !== undefined,
            'forecast days match': (r) => {
                if (r.status === 200) {
                    const body = JSON.parse(r.body);
                    return body.forecast && body.forecast.forecastday && body.forecast.forecastday.length <= days;
                }
                return false;
            },
        });
        
        check(res, {
            'no error in response': (r) => !r.body.includes('error'),
        });
    });

    // History API test (additional load for stress testing)
    if (testType === 'stress' || testType === 'load') {
        group('History Weather API', function () {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
            const dateStr = pastDate.toISOString().split('T')[0];
            
            let res = http.get(`${BASE_URL}/history.json?key=${API_KEY}&q=${city}&dt=${dateStr}`);
            trackPerformance('History Weather', res);
            
            check(res, {
                'status is 200': (r) => r.status === 200,
                'response time < 4s': (r) => r.timings.duration < 4000,
                'has history': (r) => r.status === 200 && JSON.parse(r.body).forecast !== undefined,
            });
        });
    }

    // Bulk requests simulation for stress testing
    if (testType === 'stress') {
        group('Bulk Weather Requests', function () {
            const bulkCities = getRandomItem([
                [city, getRandomItem(testData.cities)],
                [city, getRandomItem(testData.cities), getRandomItem(testData.cities)],
            ]);
            
            bulkCities.forEach((bulkCity, index) => {
                let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${bulkCity}`);
                check(res, {
                    [`bulk_request_${index}_success`]: (r) => r.status === 200,
                    [`bulk_request_${index}_fast`]: (r) => r.timings.duration < 5000,
                });
            });
        });
    }

    // Error handling test - runs occasionally
    if (Math.random() < 0.1) { // 10% chance
        group('Error Handling', function () {
            let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=InvalidCityName${Math.random()}`);
            check(res, {
                'handles invalid city gracefully': (r) => r.status === 400 || r.status === 200,
                'error response time < 2s': (r) => r.timings.duration < 2000,
                'error message present or valid response': (r) => {
                    if (r.status === 400) {
                        return JSON.parse(r.body).error !== undefined;
                    }
                    return r.status === 200;
                },
            });
        });
    }

    // API rate limiting test for stress scenarios
    if (testType === 'stress' && Math.random() < 0.05) { // 5% chance during stress
        group('Rate Limiting Test', function () {
            for (let i = 0; i < 5; i++) {
                let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`);
                check(res, {
                    [`rate_limit_request_${i}_status`]: (r) => r.status === 200 || r.status === 429,
                    [`rate_limit_request_${i}_time`]: (r) => r.timings.duration < 10000,
                });
                
                if (res.status === 429) {
                    console.log('Rate limit encountered - this is expected during stress testing');
                    break;
                }
            }
        });
    }

    sleep(sleepTime);
}

function getSleepTime(testType) {
    switch (testType.toLowerCase()) {
        case 'load':
            return Math.random() * 2 + 0.5; // 0.5-2.5 seconds
        case 'stress':
            return Math.random() * 0.5 + 0.1; // 0.1-0.6 seconds (more aggressive)
        case 'spike':
            return Math.random() * 1 + 0.2; // 0.2-1.2 seconds
        default:
            return 1; // 1 second default
    }
}

// Setup function - runs once before the test starts
export function setup() {
    const testType = __ENV.TEST_TYPE || 'default';
    console.log(`=== Performance Test Setup ===`);
    console.log(`Test Type: ${testType.toUpperCase()}`);
    console.log(`Base URL: ${BASE_URL}`);
    console.log(`API Key: ${API_KEY ? '***configured***' : 'NOT SET'}`);
    console.log(`Test Cities: ${getTestData().cities.length} cities available`);
    console.log(`Verbose Logging: ${__ENV.VERBOSE === 'true' ? 'ENABLED' : 'DISABLED'}`);
    
    // Validate API connectivity
    console.log('Validating API connectivity...');
    let testRes = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=London`);
    
    if (testRes.status !== 200) {
        console.error(`API validation failed with status: ${testRes.status}`);
        console.error(`Response: ${testRes.body}`);
        throw new Error('API validation failed - check your API key and network connectivity');
    }
    
    console.log('API validation successful');
    console.log(`================================`);
    
    return {
        testType: testType,
        startTime: new Date().toISOString(),
        apiValidated: true
    };
}

// Teardown function - runs once after the test completes
export function teardown(data) {
    console.log(`=== Performance Test Teardown ===`);
    console.log(`Test Type: ${data.testType.toUpperCase()}`);
    console.log(`Started: ${data.startTime}`);
    console.log(`Completed: ${new Date().toISOString()}`);
    console.log(`===================================`);
}