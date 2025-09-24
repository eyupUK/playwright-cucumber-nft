import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import LoginPage from "../../../../pages//appSauceDemo/loginPage";
import { title } from "process";


let loginPage: LoginPage;
setDefaultTimeout(60 * 1000 * 2)

Given('I am on the SauceDemo login page', async function (this: any) {
    this.logger.info('Starting scenario...');
    loginPage = new LoginPage(this.page);
    await loginPage.navigateToLoginPage();
});

When('I login with username {string} and password {string}', async function (username, password) {
    await loginPage.fillLogin(username, password);
    await loginPage.clickLogin();
});

Then('I should see the products page', async function () {
    const title = await loginPage.getTitle();
    expect(title).toBe('Products');
});

Then('I should see an error message containing {string}', async function (errorMsg) {
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain(errorMsg);
});