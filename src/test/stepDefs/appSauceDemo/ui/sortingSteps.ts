
import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import InventoryPage from "../../../../pages//appSauceDemo/inventoryPage";
import LoginPage from "../../../../pages//appSauceDemo/loginPage";

let loginPage: LoginPage;
let inventoryPage: InventoryPage;


Given('I am logged in as a standard user', async function (this: any) {
  this.logger.info('Starting scenario...');
    loginPage = new LoginPage(this.page);
    await loginPage.navigateToLoginPage();
    await loginPage.fillLogin("standard_user", "secret_sauce");
    await loginPage.clickLogin();
});

When('I sort products by {string}', async function (this: any,string) {
    // Write code here that turns the phrase above into concrete actions
    inventoryPage = new InventoryPage(this.page);
    expect( await inventoryPage.isLoaded()).toBeTruthy();
    await inventoryPage.sortByVisibleText(string);
});

Then('product prices should be in ascending order', async function () {
    let prices = await inventoryPage.getAllPricesInOrder();
    expect(prices).toEqual(prices.sort((a, b) => a - b));
});


Then('product names should be in descending order', async function () {
    let names = await inventoryPage.getAllProductNames();
    expect(names).toEqual([...names].sort().reverse());
});