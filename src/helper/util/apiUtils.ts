import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { options } from './logger';

let MAX_RETRIES = 1;

export default class APIUtils {

    // Utility function to make HTTP requests
    public static async sendRequest(
        base: string,
        method: string,
        endpoint: string,
        data: any = {},
        headers: Record<any, any> = {},  // Add headers as an optional parameter
        queryParams: Record<any, any> = {} // Add query parameters as an optional parameter
    ): Promise<AxiosResponse> {
        const url = `${base}${endpoint}`;
        const logger = options(method + '_' + url, "debug");

        // Prepare the axios configuration
        const config: AxiosRequestConfig = {
            method,          // HTTP method (e.g., 'POST', 'GET', etc.)
            url,             // Full URL (base + endpoint)
            data,            // Request body (for POST, PUT, etc.)
            headers,         // Request headers
            params: queryParams // Query parameters (only for GET, DELETE, etc.)
        };
        logger.info(`Request Config: ${JSON.stringify(config)}`);
        return await axios(config);
    }
}

// Example usage:
// const baseUrl = 'https://api.example.com';
// const response = await APIUtils.sendRequest(baseUrl, "post", "/login", { username: "testuser", password: "testpassword" }, {}, {});
// console.log('Response:', await response.data.username);
// console.log('Status:', response.status);

