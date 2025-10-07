# 🎯 Framework Guidance & Coding Conventions

This comprehensive guide provides coding conventions, best practices, and industry standards for developing maintainable and scalable test automation using our Playwright + Cucumber + TypeScript framework.

## 📋 Table of Contents

1. [General Framework Principles](#-general-framework-principles)
2. [TypeScript Coding Standards](#-typescript-coding-standards)
3. [UI Testing Best Practices](#-ui-testing-best-practices)
4. [API Testing Best Practices](#-api-testing-best-practices)
5. [Cucumber BDD Guidelines](#-cucumber-bdd-guidelines)
6. [Page Object Model Standards](#-page-object-model-standards)
7. [Test Data Management](#-test-data-management)
8. [Error Handling & Logging](#-error-handling--logging)
9. [Performance Testing Guidelines](#-performance-testing-guidelines)
10. [CI/CD Integration Standards](#-cicd-integration-standards)

## 🏗️ General Framework Principles

### SOLID Principles in Test Automation

**Single Responsibility Principle (SRP)**
- Each test class should have only one reason to change
- Page objects should represent a single page or component
- Utility classes should handle specific functionality

```typescript
// ✅ Good - Single responsibility
export class LoginPage {
  private page: Page;
  
  async login(username: string, password: string): Promise<void> {
    // Login-specific logic only
  }
}

// ❌ Bad - Multiple responsibilities
export class LoginPageAndValidation {
  async login(): Promise<void> { }
  async validateDatabase(): Promise<void> { }
  async sendEmail(): Promise<void> { }
}
```

**Open/Closed Principle (OCP)**
- Framework should be open for extension, closed for modification
- Use interfaces and abstract classes for extensibility

```typescript
// ✅ Good - Open for extension
interface ITestDataProvider {
  getData<T>(key: string): Promise<T>;
}

export class CsvDataProvider implements ITestDataProvider {
  async getData<T>(key: string): Promise<T> {
    // CSV implementation
  }
}

export class JsonDataProvider implements ITestDataProvider {
  async getData<T>(key: string): Promise<T> {
    // JSON implementation
  }
}
```

**Dependency Inversion Principle (DIP)**
- Depend on abstractions, not concretions
- Use dependency injection for better testability

```typescript
// ✅ Good - Dependency injection
export class TestRunner {
  constructor(
    private dataProvider: ITestDataProvider,
    private reporter: ITestReporter
  ) {}
}
```

### Framework Architecture Standards

**Layered Architecture**
```
┌─────────────────────────────────────┐
│           Test Layer                │ ← Feature files, step definitions
├─────────────────────────────────────┤
│           Business Layer            │ ← Page objects, business logic
├─────────────────────────────────────┤
│           Service Layer             │ ← API clients, utilities
├─────────────────────────────────────┤
│           Infrastructure Layer      │ ← Drivers, configurations
└─────────────────────────────────────┘
```

## 📝 TypeScript Coding Standards

### Naming Conventions

**Classes, Interfaces, and Types**
```typescript
// ✅ PascalCase for classes
export class WeatherApiClient { }
export class LoginPage { }

// ✅ PascalCase with 'I' prefix for interfaces
export interface IApiResponse { }
export interface ITestConfig { }

// ✅ PascalCase for types
export type UserRole = 'admin' | 'user' | 'guest';
export type TestEnvironment = 'dev' | 'qa' | 'staging' | 'prod';
```

**Variables, Functions, and Methods**
```typescript
// ✅ camelCase for variables and functions
const apiBaseUrl = 'https://api.example.com';
const maxRetryAttempts = 3;

// ✅ camelCase for methods
async getWeatherData(): Promise<WeatherData> { }
async validateResponseSchema(): Promise<boolean> { }
```

**Constants and Enums**
```typescript
// ✅ SCREAMING_SNAKE_CASE for constants
export const DEFAULT_TIMEOUT = 30000;
export const MAX_RETRY_ATTEMPTS = 3;
export const API_ENDPOINTS = {
  WEATHER_CURRENT: '/current.json',
  WEATHER_FORECAST: '/forecast.json'
} as const;

// ✅ PascalCase for enums
export enum HttpStatusCode {
  OK = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  INTERNAL_SERVER_ERROR = 500
}
```

### Type Safety Best Practices

**Strong Typing**
```typescript
// ✅ Good - Strong typing
export interface WeatherResponse {
  location: {
    name: string;
    country: string;
    lat: number;
    lon: number;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      code: number;
    };
  };
}

// ✅ Good - Generic types
export class ApiClient<T> {
  async get<R = T>(endpoint: string): Promise<R> {
    // Implementation
  }
}

// ❌ Bad - Using 'any'
const response: any = await apiClient.get('/weather');
```

**Optional vs Required Properties**
```typescript
// ✅ Good - Clear optional properties
export interface TestConfig {
  baseUrl: string;                    // Required
  timeout?: number;                   // Optional
  retryAttempts?: number;            // Optional
  headless?: boolean;                // Optional
}

// ✅ Good - Using utility types
export type PartialTestConfig = Partial<TestConfig>;
export type RequiredTestConfig = Required<TestConfig>;
```

### Error Handling Standards

**Custom Error Types**
```typescript
// ✅ Good - Custom error classes
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public endpoint: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class PageLoadError extends Error {
  constructor(
    message: string,
    public url: string,
    public timeout: number
  ) {
    super(message);
    this.name = 'PageLoadError';
  }
}
```

## 🖥️ UI Testing Best Practices

### Page Object Model Implementation

**Base Page Structure**
```typescript
// ✅ Good - Base page with common functionality
export abstract class BasePage {
  protected page: Page;
  
  constructor(page: Page) {
    this.page = page;
  }
  
  // Common actions available to all pages
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }
  
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
  }
  
  // Abstract methods that must be implemented
  abstract getPageUrl(): string;
  abstract isPageLoaded(): Promise<boolean>;
}
```

**Specific Page Implementation**
```typescript
// ✅ Good - Specific page extending base page
export class LoginPage extends BasePage {
  // Locators as private readonly properties
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly loginButton = this.page.locator('#login-button');
  private readonly errorMessage = this.page.locator('.error-message');
  
  getPageUrl(): string {
    return '/login';
  }
  
  async isPageLoaded(): Promise<boolean> {
    return await this.loginButton.isVisible();
  }
  
  // Business logic methods
  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
  
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }
  
  // Validation methods
  async isLoginSuccessful(): Promise<boolean> {
    await this.page.waitForURL(/dashboard/);
    return this.page.url().includes('dashboard');
  }
}
```

### Locator Strategies

**Best Practices for Selectors**
```typescript
// ✅ Good - Hierarchical order of preference
// 1. Data attributes (most stable)
private readonly submitButton = this.page.locator('[data-testid="submit-btn"]');

// 2. ID attributes (if stable)
private readonly usernameField = this.page.locator('#username');

// 3. Semantic roles and labels
private readonly loginButton = this.page.getByRole('button', { name: 'Login' });
private readonly emailInput = this.page.getByLabel('Email address');

// 4. Text content (for buttons and links)
private readonly signUpLink = this.page.getByText('Sign up');

// ❌ Avoid - Fragile selectors
private readonly badSelector = this.page.locator('div > div:nth-child(3) > span.class1.class2');
```

**Dynamic Locators**
```typescript
// ✅ Good - Dynamic locators with parameters
export class ProductPage extends BasePage {
  private getProductByName(productName: string): Locator {
    return this.page.locator(`[data-testid="product-${productName}"]`);
  }
  
  private getProductPrice(productId: string): Locator {
    return this.page.locator(`[data-product-id="${productId}"] .price`);
  }
  
  async selectProduct(productName: string): Promise<void> {
    await this.getProductByName(productName).click();
  }
}
```

### Wait Strategies

**Explicit Waits**
```typescript
// ✅ Good - Explicit waits for specific conditions
export class ShoppingCartPage extends BasePage {
  async waitForCartToLoad(): Promise<void> {
    await this.page.waitForSelector('[data-testid="cart-items"]');
    await this.page.waitForLoadState('networkidle');
  }
  
  async waitForPriceUpdate(): Promise<void> {
    // Wait for specific element to appear
    await this.page.waitForSelector('.price-updated', { 
      state: 'visible',
      timeout: 10000 
    });
  }
  
  async waitForApiResponse(): Promise<void> {
    // Wait for specific API call to complete
    await this.page.waitForResponse(response => 
      response.url().includes('/api/cart') && response.status() === 200
    );
  }
}
```

### Element Interaction Patterns

**Safe Element Interactions**
```typescript
// ✅ Good - Safe element interactions with error handling
export class FormPage extends BasePage {
  async fillFormField(locator: Locator, value: string): Promise<void> {
    try {
      await locator.waitFor({ state: 'visible' });
      await locator.clear();
      await locator.fill(value);
      
      // Verify the value was entered correctly
      const actualValue = await locator.inputValue();
      if (actualValue !== value) {
        throw new Error(`Failed to fill field. Expected: ${value}, Actual: ${actualValue}`);
      }
    } catch (error) {
      throw new Error(`Failed to fill form field: ${error.message}`);
    }
  }
  
  async selectDropdownOption(dropdown: Locator, optionText: string): Promise<void> {
    await dropdown.waitFor({ state: 'visible' });
    await dropdown.click();
    
    const option = this.page.locator(`text="${optionText}"`);
    await option.waitFor({ state: 'visible' });
    await option.click();
    
    // Verify selection
    const selectedValue = await dropdown.textContent();
    if (!selectedValue?.includes(optionText)) {
      throw new Error(`Failed to select option: ${optionText}`);
    }
  }
}
```

## 🔌 API Testing Best Practices

### API Client Architecture

**Base API Client**
```typescript
// ✅ Good - Base API client with common functionality
export abstract class BaseApiClient {
  protected baseUrl: string;
  protected defaultHeaders: Record<string, string>;
  
  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
    };
  }
  
  protected async makeRequest<T>(
    method: string,
    endpoint: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const requestHeaders = { ...this.defaultHeaders, ...headers };
    
    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: data ? JSON.stringify(data) : undefined
      });
      
      const responseData = await response.json();
      
      return {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        success: response.ok
      };
    } catch (error) {
      throw new ApiError(`Request failed: ${error.message}`, 0, endpoint);
    }
  }
  
  // HTTP method implementations
  async get<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, undefined, headers);
  }
  
  async post<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('POST', endpoint, data, headers);
  }
  
  async put<T>(endpoint: string, data: any, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('PUT', endpoint, data, headers);
  }
  
  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, undefined, headers);
  }
}
```

**Specific API Client Implementation**
```typescript
// ✅ Good - Specific API client extending base client
export class WeatherApiClient extends BaseApiClient {
  constructor(apiKey: string) {
    super('https://api.weatherapi.com/v1', apiKey);
  }
  
  async getCurrentWeather(city: string): Promise<WeatherResponse> {
    const response = await this.get<WeatherResponse>(`/current.json?q=${city}`);
    
    if (!response.success) {
      throw new ApiError(
        `Failed to get weather for ${city}`,
        response.status,
        '/current.json'
      );
    }
    
    return response.data;
  }
  
  async getForecast(city: string, days: number = 3): Promise<ForecastResponse> {
    const response = await this.get<ForecastResponse>(`/forecast.json?q=${city}&days=${days}`);
    
    if (!response.success) {
      throw new ApiError(
        `Failed to get forecast for ${city}`,
        response.status,
        '/forecast.json'
      );
    }
    
    return response.data;
  }
  
  async getBulkWeather(cities: string[]): Promise<WeatherResponse[]> {
    const requests = cities.map(city => this.getCurrentWeather(city));
    return Promise.all(requests);
  }
}
```

### Response Validation & Schema Testing

**JSON Schema Validation**
```typescript
// ✅ Good - JSON schema validation
export class ApiValidator {
  private ajv = new Ajv();
  
  validateWeatherResponse(response: any): ValidationResult {
    const schema = {
      type: 'object',
      required: ['location', 'current'],
      properties: {
        location: {
          type: 'object',
          required: ['name', 'country', 'lat', 'lon'],
          properties: {
            name: { type: 'string' },
            country: { type: 'string' },
            lat: { type: 'number' },
            lon: { type: 'number' }
          }
        },
        current: {
          type: 'object',
          required: ['temp_c', 'condition'],
          properties: {
            temp_c: { type: 'number' },
            condition: {
              type: 'object',
              required: ['text', 'code'],
              properties: {
                text: { type: 'string' },
                code: { type: 'number' }
              }
            }
          }
        }
      }
    };
    
    const validate = this.ajv.compile(schema);
    const valid = validate(response);
    
    return {
      isValid: valid,
      errors: validate.errors || []
    };
  }
}
```

**Response Assertions**
```typescript
// ✅ Good - Comprehensive response assertions
export class ApiAssertions {
  static assertSuccessResponse<T>(response: ApiResponse<T>): void {
    expect(response.success).toBe(true);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(300);
    expect(response.data).toBeDefined();
  }
  
  static assertErrorResponse(response: ApiResponse<any>, expectedStatus: number): void {
    expect(response.success).toBe(false);
    expect(response.status).toBe(expectedStatus);
    expect(response.data.error).toBeDefined();
  }
  
  static assertResponseTime(startTime: number, maxDuration: number): void {
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThanOrEqual(maxDuration);
  }
  
  static assertResponseHeaders(response: ApiResponse<any>, expectedHeaders: Record<string, string>): void {
    Object.entries(expectedHeaders).forEach(([key, value]) => {
      expect(response.headers[key.toLowerCase()]).toBe(value);
    });
  }
}
```

### API Test Data Management

**Test Data Builder Pattern**
```typescript
// ✅ Good - Builder pattern for test data
export class WeatherRequestBuilder {
  private request: Partial<WeatherRequest> = {};
  
  withCity(city: string): WeatherRequestBuilder {
    this.request.city = city;
    return this;
  }
  
  withDays(days: number): WeatherRequestBuilder {
    this.request.days = days;
    return this;
  }
  
  withUnits(units: 'metric' | 'imperial'): WeatherRequestBuilder {
    this.request.units = units;
    return this;
  }
  
  build(): WeatherRequest {
    if (!this.request.city) {
      throw new Error('City is required for weather request');
    }
    
    return {
      city: this.request.city,
      days: this.request.days || 3,
      units: this.request.units || 'metric'
    };
  }
}

// Usage
const weatherRequest = new WeatherRequestBuilder()
  .withCity('London')
  .withDays(5)
  .withUnits('metric')
  .build();
```

## 🥒 Cucumber BDD Guidelines

### Feature File Standards

**Well-Structured Feature Files**
```gherkin
# ✅ Good - Clear feature structure
@weather-api @api
Feature: Weather API Current Weather Endpoint
  As a weather service consumer
  I want to get current weather information for a city
  So that I can display accurate weather data to users

  Background:
    Given the Weather API is available
    And I have a valid API key

  @positive @smoke
  Scenario: Get current weather for valid city
    When I request current weather for "London"
    Then the response status should be 200
    And the response should contain weather data for "London"
    And the response should include current temperature
    And the response time should be less than 2000 milliseconds

  @negative
  Scenario: Get current weather for invalid city
    When I request current weather for "InvalidCityName123"
    Then the response status should be 400
    And the response should contain an error message
    And the error message should indicate invalid city

  @data-driven
  Scenario Outline: Get current weather for multiple cities
    When I request current weather for "<city>"
    Then the response status should be 200
    And the response should contain weather data for "<city>"
    And the temperature should be a valid number

    Examples:
      | city      |
      | London    |
      | New York  |
      | Tokyo     |
      | Sydney    |
```

**Step Definition Best Practices**
```typescript
// ✅ Good - Well-structured step definitions
export class WeatherApiSteps {
  private apiClient: WeatherApiClient;
  private response: ApiResponse<WeatherResponse>;
  private requestStartTime: number;
  
  constructor(private world: CustomWorld) {
    this.apiClient = new WeatherApiClient(process.env.WEATHER_API_KEY!);
  }
  
  @Given('the Weather API is available')
  async verifyApiAvailability(): Promise<void> {
    try {
      // Health check or simple request to verify API availability
      const response = await this.apiClient.getCurrentWeather('London');
      expect(response).toBeDefined();
    } catch (error) {
      throw new Error(`Weather API is not available: ${error.message}`);
    }
  }
  
  @When('I request current weather for {string}')
  async requestCurrentWeather(city: string): Promise<void> {
    this.requestStartTime = Date.now();
    
    try {
      this.response = await this.apiClient.get<WeatherResponse>(`/current.json?q=${city}`);
    } catch (error) {
      // Store error response for negative test scenarios
      this.response = error.response;
    }
  }
  
  @Then('the response status should be {int}')
  async verifyResponseStatus(expectedStatus: number): Promise<void> {
    expect(this.response.status).toBe(expectedStatus);
  }
  
  @Then('the response should contain weather data for {string}')
  async verifyWeatherData(city: string): Promise<void> {
    expect(this.response.data.location.name.toLowerCase()).toContain(city.toLowerCase());
    expect(this.response.data.current).toBeDefined();
    expect(this.response.data.current.temp_c).toBeTypeOf('number');
  }
  
  @Then('the response time should be less than {int} milliseconds')
  async verifyResponseTime(maxDuration: number): Promise<void> {
    const duration = Date.now() - this.requestStartTime;
    expect(duration).toBeLessThanOrEqual(maxDuration);
    
    // Log performance metrics
    this.world.logger.info(`API Response Time: ${duration}ms`);
  }
}
```

### Scenario Design Principles

**GIVEN-WHEN-THEN Structure**
```gherkin
# ✅ Good - Clear separation of concerns
Scenario: User login with valid credentials
  Given the user is on the login page          # Context/Setup
  And the user has valid credentials           # Preconditions
  When the user enters username "testuser"     # Action
  And the user enters password "password123"   # Action
  And the user clicks the login button         # Action
  Then the user should be redirected to dashboard # Outcome
  And the user should see welcome message      # Verification
  And the login session should be active       # State verification
```

**Data-Driven Testing**
```gherkin
# ✅ Good - Parameterized scenarios
@data-driven
Scenario Outline: Login with different user roles
  Given the user is on the login page
  When the user logs in as "<role>" with credentials
  Then the user should have "<access_level>" access
  And the user should see "<dashboard_type>" dashboard

  Examples:
    | role          | access_level | dashboard_type |
    | admin         | full         | admin          |
    | manager       | limited      | manager        |
    | employee      | basic        | employee       |
    | guest         | read-only    | guest          |
```

## 📊 Test Data Management

### Test Data Organization

**Environment-Specific Data**
```typescript
// ✅ Good - Environment-specific test data
export class TestDataManager {
  private static testData: Map<string, any> = new Map();
  
  static getEnvironmentData(): EnvironmentConfig {
    const env = process.env.NODE_ENV || 'staging';
    
    const environmentConfigs: Record<string, EnvironmentConfig> = {
      dev: {
        baseUrl: 'https://dev.example.com',
        apiKey: process.env.DEV_API_KEY,
        users: {
          admin: { username: 'dev_admin', password: 'dev_pass123' },
          user: { username: 'dev_user', password: 'dev_pass456' }
        }
      },
      qa: {
        baseUrl: 'https://qa.example.com',
        apiKey: process.env.QA_API_KEY,
        users: {
          admin: { username: 'qa_admin', password: 'qa_pass123' },
          user: { username: 'qa_user', password: 'qa_pass456' }
        }
      },
      staging: {
        baseUrl: 'https://staging.example.com',
        apiKey: process.env.STAGING_API_KEY,
        users: {
          admin: { username: 'staging_admin', password: 'staging_pass123' },
          user: { username: 'staging_user', password: 'staging_pass456' }
        }
      }
    };
    
    return environmentConfigs[env];
  }
  
  static getTestUsers(): UserCredentials[] {
    return [
      {
        role: 'admin',
        username: 'admin@example.com',
        password: 'AdminPass123!',
        permissions: ['read', 'write', 'delete', 'admin']
      },
      {
        role: 'user',
        username: 'user@example.com',
        password: 'UserPass123!',
        permissions: ['read', 'write']
      },
      {
        role: 'guest',
        username: 'guest@example.com',
        password: 'GuestPass123!',
        permissions: ['read']
      }
    ];
  }
}
```

**CSV Data Integration**
```typescript
// ✅ Good - CSV data loader
export class CsvDataLoader {
  async loadTestData<T>(filePath: string): Promise<T[]> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      });
      
      return records as T[];
    } catch (error) {
      throw new Error(`Failed to load CSV data from ${filePath}: ${error.message}`);
    }
  }
  
  async getCities(): Promise<CityData[]> {
    return this.loadTestData<CityData>('src/helper/util/testData/cities.csv');
  }
  
  async getWeatherTestCases(): Promise<WeatherTestCase[]> {
    return this.loadTestData<WeatherTestCase>('src/helper/util/testData/weather_test_cases.csv');
  }
}
```

### Sensitive Data Handling

**Environment Variables for Secrets**
```typescript
// ✅ Good - Secure configuration management
export class ConfigManager {
  private static config: AppConfig;
  
  static getConfig(): AppConfig {
    if (!this.config) {
      this.config = {
        // API credentials
        weatherApiKey: this.getRequiredEnv('WEATHER_API_KEY'),
        weatherApiUrl: this.getRequiredEnv('WEATHER_API_URL'),
        
        // Database credentials (if needed)
        dbConnectionString: process.env.DB_CONNECTION_STRING,
        
        // Test configuration
        headless: process.env.HEADLESS === 'true',
        slowMo: parseInt(process.env.SLOW_MO || '0'),
        timeout: parseInt(process.env.TIMEOUT || '30000'),
        
        // Reporting
        generateVideo: process.env.GENERATE_VIDEO === 'true',
        generateTrace: process.env.GENERATE_TRACE === 'true'
      };
    }
    
    return this.config;
  }
  
  private static getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
  }
}
```

## 🚨 Error Handling & Logging

### Structured Logging

**Winston Logger Configuration**
```typescript
// ✅ Good - Structured logging setup
export class Logger {
  private static instance: winston.Logger;
  
  static getInstance(): winston.Logger {
    if (!this.instance) {
      this.instance = winston.createLogger({
        level: process.env.LOG_LEVEL || 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.colorize(),
          winston.format.printf(({ timestamp, level, message, stack }) => {
            return `${timestamp} [${level}]: ${message}${stack ? '\n' + stack : ''}`;
          })
        ),
        transports: [
          new winston.transports.Console(),
          new winston.transports.File({ 
            filename: 'logs/test-execution.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
          }),
          new winston.transports.File({
            filename: 'logs/errors.log',
            level: 'error',
            maxsize: 5242880,
            maxFiles: 3
          })
        ]
      });
    }
    
    return this.instance;
  }
}
```

**Test Execution Logging**
```typescript
// ✅ Good - Comprehensive test logging
export class TestExecutionLogger {
  private logger = Logger.getInstance();
  
  logTestStart(testName: string, scenario: string): void {
    this.logger.info(`🚀 Starting test: ${testName}`, {
      test: testName,
      scenario: scenario,
      timestamp: new Date().toISOString(),
      event: 'test_start'
    });
  }
  
  logTestEnd(testName: string, status: 'passed' | 'failed', duration: number): void {
    const emoji = status === 'passed' ? '✅' : '❌';
    this.logger.info(`${emoji} Test completed: ${testName} (${duration}ms)`, {
      test: testName,
      status: status,
      duration: duration,
      event: 'test_end'
    });
  }
  
  logApiRequest(method: string, url: string, statusCode: number, duration: number): void {
    this.logger.info(`📡 API ${method} ${url} - ${statusCode} (${duration}ms)`, {
      method: method,
      url: url,
      statusCode: statusCode,
      duration: duration,
      event: 'api_request'
    });
  }
  
  logError(error: Error, context?: any): void {
    this.logger.error('❌ Test execution error', {
      error: error.message,
      stack: error.stack,
      context: context,
      event: 'error'
    });
  }
}
```

### Exception Handling Patterns

**Try-Catch-Finally Patterns**
```typescript
// ✅ Good - Comprehensive error handling
export class RobustTestExecution {
  private logger = Logger.getInstance();
  
  async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.logger.info(`Attempt ${attempt}/${maxAttempts}`);
        const result = await operation();
        
        if (attempt > 1) {
          this.logger.info(`✅ Operation succeeded on attempt ${attempt}`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`❌ Attempt ${attempt} failed: ${error.message}`);
        
        if (attempt < maxAttempts) {
          this.logger.info(`⏳ Waiting ${delayMs}ms before retry...`);
          await this.sleep(delayMs);
        }
      }
    }
    
    throw new Error(`Operation failed after ${maxAttempts} attempts. Last error: ${lastError.message}`);
  }
  
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## ⚡ Performance Testing Guidelines

### k6 Script Organization

**Modular k6 Scripts**
```javascript
// ✅ Good - Modular k6 script structure
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('custom_error_rate');
const responseTime = new Trend('custom_response_time');

// Test data
const cities = new SharedArray('cities', function() {
  return JSON.parse(open('./test-data/cities.json'));
});

// Test configuration based on environment
export const options = {
  stages: getLoadPattern(getTestType()),
  thresholds: getThresholds(),
  ext: {
    loadimpact: {
      distribution: {
        'us-east-1': { loadZone: 'amazon:us:ashburn', percent: 100 }
      }
    }
  }
};

function getTestType() {
  return __ENV.TEST_TYPE || 'smoke';
}

function getLoadPattern(testType) {
  const patterns = {
    smoke: [
      { duration: '1m', target: 1 }
    ],
    load: [
      { duration: '2m', target: 20 },
      { duration: '5m', target: 20 },
      { duration: '2m', target: 50 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 0 }
    ],
    stress: [
      { duration: '2m', target: 10 },
      { duration: '5m', target: 50 },
      { duration: '2m', target: 100 },
      { duration: '5m', target: 100 },
      { duration: '2m', target: 200 },
      { duration: '5m', target: 200 },
      { duration: '10m', target: 0 }
    ]
  };
  
  return patterns[testType] || patterns.smoke;
}

// Main test function
export default function() {
  const city = cities[Math.floor(Math.random() * cities.length)];
  
  group('Weather API Tests', function() {
    testCurrentWeather(city);
    testForecastWeather(city);
  });
  
  sleep(1);
}

function testCurrentWeather(city) {
  group('Current Weather', function() {
    const startTime = Date.now();
    const response = http.get(`${BASE_URL}/current.json?key=${API_KEY}&q=${city.name}`);
    const duration = Date.now() - startTime;
    
    // Record custom metrics
    responseTime.add(duration);
    errorRate.add(response.status !== 200);
    
    // Validation checks
    const validationResult = check(response, {
      'status is 200': (r) => r.status === 200,
      'response time < 2s': (r) => duration < 2000,
      'has location data': (r) => r.json('location.name') !== undefined,
      'has current weather': (r) => r.json('current.temp_c') !== undefined
    });
    
    if (!validationResult) {
      console.error(`Validation failed for ${city.name}: ${response.status} - ${response.body}`);
    }
  });
}
```

### Performance Test Data Management

**Dynamic Test Data Generation**
```javascript
// ✅ Good - Dynamic test data for performance tests
export class PerformanceTestDataGenerator {
  static generateWeatherRequests(count) {
    const cities = [
      'London', 'New York', 'Tokyo', 'Sydney', 'Berlin', 
      'Istanbul', 'Paris', 'Moscow', 'Madrid', 'Rome'
    ];
    
    const requests = [];
    for (let i = 0; i < count; i++) {
      requests.push({
        city: cities[Math.floor(Math.random() * cities.length)],
        days: Math.floor(Math.random() * 7) + 1,
        timestamp: Date.now()
      });
    }
    
    return requests;
  }
  
  static generateUserScenarios() {
    return [
      { weight: 70, scenario: 'getCurrentWeather' },
      { weight: 20, scenario: 'getForecast' },
      { weight: 10, scenario: 'getHistoricalData' }
    ];
  }
}
```

## 🔄 CI/CD Integration Standards

### GitHub Actions Configuration

**Comprehensive Workflow Setup**
```yaml
# ✅ Good - Complete CI/CD workflow
name: Automated Testing Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to test'
        required: true
        default: 'staging'
        type: choice
        options:
        - staging
        - qa
        - prod
      browser:
        description: 'Browser to test'
        required: true
        default: 'chromium'
        type: choice
        options:
        - chromium
        - firefox
        - webkit
      test_suite:
        description: 'Test suite to run'
        required: true
        default: 'smoke'
        type: choice
        options:
        - smoke
        - regression
        - api
        - ui

jobs:
  lint-and-type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: Run TypeScript type checking
        run: npm run type-check

  api-tests:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    strategy:
      matrix:
        environment: [staging, qa]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run API tests
        run: npm test -- --tags="@api"
        env:
          ENV: ${{ matrix.environment }}
          WEATHER_API_KEY: ${{ secrets.WEATHER_API_KEY }}
      
      - name: Upload API test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: api-test-results-${{ matrix.environment }}
          path: |
            test-results/
            allure-results/

  ui-tests:
    needs: lint-and-type-check
    runs-on: ubuntu-latest
    strategy:
      matrix:
        browser: [chromium, firefox, webkit]
        environment: [staging, qa]
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright browsers
        run: npx playwright install
      
      - name: Run UI tests
        run: npm test -- --tags="@ui"
        env:
          BROWSER: ${{ matrix.browser }}
          ENV: ${{ matrix.environment }}
          HEAD: false
      
      - name: Upload UI test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: ui-test-results-${{ matrix.browser }}-${{ matrix.environment }}
          path: |
            test-results/
            playwright-report/
            allure-results/

  performance-tests:
    needs: [api-tests]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Setup k6
        uses: grafana/setup-k6-action@v1
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run performance tests
        run: |
          npm run k6:load
          npm run k6:report
        env:
          WEATHER_API_KEY: ${{ secrets.WEATHER_API_KEY }}
          K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}
      
      - name: Upload performance results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: performance-test-results
          path: |
            k6-*results*.json
            k6-performance-report.html

  generate-report:
    needs: [api-tests, ui-tests, performance-tests]
    runs-on: ubuntu-latest
    if: always()
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Download all artifacts
        uses: actions/download-artifact@v4
      
      - name: Generate consolidated report
        run: |
          # Install Allure
          npm install -g allure-commandline
          
          # Merge all allure-results
          mkdir -p consolidated-allure-results
          find . -path "*/allure-results/*" -name "*.json" -exec cp {} consolidated-allure-results/ \;
          
          # Generate Allure report
          allure generate consolidated-allure-results -o allure-report --clean
      
      - name: Upload consolidated report
        uses: actions/upload-artifact@v4
        with:
          name: consolidated-test-report
          path: allure-report/
          retention-days: 30
      
      - name: Comment PR with test results
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const { readFileSync } = require('fs');
            
            // Read test results and create comment
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Automated test results are available in the artifacts!'
            });
```

### Quality Gates & Reporting

**Test Results Analysis**
```typescript
// ✅ Good - Automated quality gates
export class QualityGateAnalyzer {
  static analyzeTestResults(testResults: TestResult[]): QualityGateResult {
    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.status === 'passed').length;
    const failedTests = testResults.filter(t => t.status === 'failed').length;
    const passRate = (passedTests / totalTests) * 100;
    
    const qualityGates = {
      minimumPassRate: 95,
      maximumExecutionTime: 30 * 60 * 1000, // 30 minutes
      criticalTestsPassRate: 100
    };
    
    const criticalTests = testResults.filter(t => t.tags.includes('@critical'));
    const criticalPassRate = criticalTests.length > 0 
      ? (criticalTests.filter(t => t.status === 'passed').length / criticalTests.length) * 100
      : 100;
    
    const totalExecutionTime = testResults.reduce((sum, t) => sum + t.duration, 0);
    
    return {
      passed: passRate >= qualityGates.minimumPassRate && 
             criticalPassRate >= qualityGates.criticalTestsPassRate &&
             totalExecutionTime <= qualityGates.maximumExecutionTime,
      metrics: {
        totalTests,
        passedTests,
        failedTests,
        passRate,
        criticalPassRate,
        totalExecutionTime
      },
      recommendations: this.generateRecommendations(passRate, criticalPassRate, totalExecutionTime)
    };
  }
  
  private static generateRecommendations(
    passRate: number, 
    criticalPassRate: number, 
    executionTime: number
  ): string[] {
    const recommendations = [];
    
    if (passRate < 95) {
      recommendations.push('🔴 Pass rate below 95% - investigate failing tests');
    }
    
    if (criticalPassRate < 100) {
      recommendations.push('🚨 Critical tests failing - immediate attention required');
    }
    
    if (executionTime > 20 * 60 * 1000) {
      recommendations.push('⏰ Execution time over 20 minutes - consider parallel execution');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('✅ All quality gates passed - great job!');
    }
    
    return recommendations;
  }
}
```

## 📋 Code Review Checklist

### Pre-Commit Checklist

**Development Standards**
- [ ] **TypeScript Compilation**: Code compiles without errors
- [ ] **Linting**: ESLint passes without warnings
- [ ] **Type Safety**: No use of `any` type unless absolutely necessary
- [ ] **Naming Conventions**: Follow established naming patterns
- [ ] **Error Handling**: Proper try-catch blocks and error messages

**Test Quality**
- [ ] **Test Coverage**: New code has corresponding tests
- [ ] **Assertion Quality**: Tests have meaningful assertions
- [ ] **Test Independence**: Tests don't depend on execution order
- [ ] **Data Cleanup**: Tests clean up after themselves
- [ ] **Flaky Tests**: No intermittent failures

**Documentation**
- [ ] **Code Comments**: Complex logic is documented
- [ ] **README Updates**: Documentation reflects changes
- [ ] **API Documentation**: New endpoints documented
- [ ] **Change Log**: Breaking changes noted

**Performance & Security**
- [ ] **No Hardcoded Secrets**: Sensitive data uses environment variables
- [ ] **Performance Impact**: Changes don't significantly impact execution time
- [ ] **Resource Cleanup**: Proper disposal of resources (browsers, connections)

---

**📚 Framework Guidance Documentation**  
**🔧 Version:** 1.0.0  
**👨‍💻 Author:** EyupUK  
**📅 Last Updated:** October 2025  
**⭐ Standards:** TypeScript | Playwright | Cucumber | Industry Best Practices