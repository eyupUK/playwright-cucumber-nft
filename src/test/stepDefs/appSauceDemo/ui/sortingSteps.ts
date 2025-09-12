
import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../../../hooks/pageFixture";
import InventoryPage from "../../../../pages//appSauceDemo/inventoryPage";
import LoginPage from "../../../../pages//appSauceDemo/loginPage";

let loginPage: LoginPage;
let inventoryPage: InventoryPage;


Given('I am logged in as a standard user', async function () {
    // Write code here that turns the phrase above into concrete actions
    loginPage = new LoginPage(fixture.page);
    await loginPage.navigateToLoginPage();
    await loginPage.fillLogin("standard_user", "secret_sauce");
    await loginPage.clickLogin();
});

When('I sort products by {string}', async function (string) {
    // Write code here that turns the phrase above into concrete actions
    inventoryPage = new InventoryPage(fixture.page);
    expect( await inventoryPage.isLoaded()).toBeTruthy();
    await inventoryPage.sortByVisibleText(string);
});

Then('product prices should be in ascending order', async function () {
    let prices = await inventoryPage.getAllPricesInOrder();
    expect(prices).toEqual(prices.sort((a, b) => a - b));
});


Then('product names should be in descending order', async function () {
    let names = await inventoryPage.getAllProductNames();
    let sortedNames = [...names].sort().reverse();
    expect(names).toEqual(sortedNames);
});