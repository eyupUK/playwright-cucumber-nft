import { Before, Given, When, Then } from '@cucumber/cucumber';
import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, Result } from 'axe-core';
import { expect } from '@playwright/test';
import LoginPage from '../../../pages/appSauceDemo/loginPage';
import InventoryPage from '../../../pages/appSauceDemo/inventoryPage';
import CartPage from '../../../pages/appSauceDemo/cartPage';
import CheckoutInfoPage from '../../../pages/appSauceDemo/checkoutInfoPage';
import CheckoutOverviewPage from '../../../pages/appSauceDemo/checkoutOverviewPage';
import CheckoutCompletePage from '../../../pages/appSauceDemo/checkoutCompletePage';

let loginPage: LoginPage | undefined;
let inventoryPage: InventoryPage | undefined;
let cartPage: CartPage | undefined;
let checkoutInfoPage: CheckoutInfoPage | undefined;
let checkoutOverviewPage: CheckoutOverviewPage | undefined;
let checkoutCompletePage: CheckoutCompletePage | undefined;
let lastAccessibilityResults: AxeResults | undefined;

const username = process.env.SAUCE_STANDARD_USER ?? 'standard_user';
const password = process.env.SAUCE_STANDARD_PASSWORD ?? 'secret_sauce';

Before(function (this: any) {
  loginPage = undefined;
  inventoryPage = undefined;
  cartPage = undefined;
  checkoutInfoPage = undefined;
  checkoutOverviewPage = undefined;
  checkoutCompletePage = undefined;
  lastAccessibilityResults = undefined;
});

Given('I open the SauceDemo login page', async function (this: any) {
  loginPage = new LoginPage(this.page);
  await loginPage.navigateToLoginPage();
  await this.page.waitForLoadState('networkidle');
});

Given('I login to SauceDemo as standard user', async function (this: any) {
  loginPage = new LoginPage(this.page);
  await loginPage.navigateToLoginPage();
  await loginPage.fillLogin(username, password);
  await loginPage.clickLogin();
  inventoryPage = new InventoryPage(this.page);
  await inventoryPage.isLoaded();
});

Given('I open the cart page', async function (this: any) {
  inventoryPage = new InventoryPage(this.page);
  await inventoryPage.isLoaded();
  await inventoryPage.openCart();
  cartPage = new CartPage(this.page);
  await cartPage.isLoaded();
});

Given('I proceed to checkout information page', async function (this: any) {
  cartPage = cartPage ?? new CartPage(this.page);
  await cartPage.isLoaded();
  await cartPage.proceedToCheckout();
  checkoutInfoPage = new CheckoutInfoPage(this.page);
  await checkoutInfoPage.isLoaded();
});

Given('I fill the checkout form with valid data', async function (this: any) {
  checkoutInfoPage = checkoutInfoPage ?? new CheckoutInfoPage(this.page);
  await checkoutInfoPage.isLoaded();
  await checkoutInfoPage.fillInfo('Jane', 'Doe', '90210');
  await checkoutInfoPage.continueToOverview();
  checkoutOverviewPage = new CheckoutOverviewPage(this.page);
  await checkoutOverviewPage.isLoaded();
});

Given('I finish the checkout accessibility scanning', async function (this: any) {
  checkoutOverviewPage = checkoutOverviewPage ?? new CheckoutOverviewPage(this.page);
  await checkoutOverviewPage.isLoaded();
  await checkoutOverviewPage.finish();
  checkoutCompletePage = new CheckoutCompletePage(this.page);
  await checkoutCompletePage.isLoaded();
});

Given('I try to login with invalid credentials', async function (this: any) {
  loginPage = loginPage ?? new LoginPage(this.page);
  await loginPage.fillLogin('locked_user', 'wrong_password');
  await loginPage.clickLogin();
  await this.page.waitForLoadState('networkidle');
  await this.page.locator("h3[data-test='error']").waitFor({ state: 'visible' });
});

When('I scan the page for accessibility issues', async function (this: any) {
  await this.page.waitForLoadState('networkidle');
  await this.page.waitForTimeout(250);
  const results = await new AxeBuilder({ page: this.page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();
  lastAccessibilityResults = results;

  if (this.attach) {
    await this.attach(JSON.stringify(results, null, 2), 'application/json');
  }
});

Then('there should be no serious or critical accessibility violations', function (this: any) {
  expect(lastAccessibilityResults, 'Accessibility scan results are missing. Run the scan step first.').toBeTruthy();
  const severeViolations =
    lastAccessibilityResults?.violations.filter((violation: Result) =>
      violation.impact === 'serious' || violation.impact === 'critical',
    ) ?? [];

  if (severeViolations.length > 0 && this.attach) {
    const summary = severeViolations.map((v: Result) => `${v.id}: ${v.description}`).join('\n');
    this.attach(summary, 'text/plain');
  }

  expect(
    severeViolations.length,
    `Found serious/critical accessibility violations: ${severeViolations
      .map((v: Result) => `${v.id} (${v.nodes.length} nodes)`)
      .join(', ')}`,
  ).toBe(0);
});
