import http from 'k6/http';
import { check, sleep, group } from 'k6';

export const options = {
    vus: 10,
    duration: '30s',
    thresholds: {
        http_req_duration: ['p(95)<1000'], // 95% of requests should be below 1s
        http_req_failed: ['rate<0.5'], // allow up to 50% failures for debugging
    },
};

const BASE_URL = __ENV.WEATHERAPI_BASEURL || 'https://api.weatherapi.com/v1';
const API_KEY = __ENV.WEATHERAPI_KEY || '31ea33c30d254920977133231250909';

const cities = ['London', 'New York', 'Tokyo', 'Sydney', 'Berlin', 'Istanbul', 'Paris', 'Moscow'];
const forecastDays = [1, 3, 5];

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
    const city = getRandomItem(cities);
    const days = getRandomItem(forecastDays);

    group('Current Weather', function () {
        let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city}`);
        check(res, {
            'status is 200': (r) => r.status === 200,
            'has location': (r) => r.status === 200 && JSON.parse(r.body).location !== undefined,
            'has current weather': (r) => r.status === 200 && JSON.parse(r.body).current !== undefined,
        });
        check(res, {
            'no error in response': (r) => !r.body.includes('error'),
        });
    });

    group('Forecast Weather', function () {
        let res = http.get(`${BASE_URL}/forecast.json?key=${API_KEY}&q=${city}&days=${days}`);
        check(res, {
            'status is 200': (r) => r.status === 200,
            'has forecast': (r) => r.status === 200 && JSON.parse(r.body).forecast !== undefined,
        });
        check(res, {
            'no error in response': (r) => !r.body.includes('error'),
        });
    });

    // Optionally, test error handling with an invalid city
    group('Invalid City', function () {
        let res = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=InvalidCityName123`);
        check(res, {
            'status is 400 or 200': (r) => r.status === 400 || r.status === 200,
            'error message present': (r) => r.status === 400 ? JSON.parse(r.body).error !== undefined : true,
        });
    });

    sleep(1);
}