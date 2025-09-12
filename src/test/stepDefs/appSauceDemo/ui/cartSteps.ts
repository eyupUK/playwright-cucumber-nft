import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { fixture } from "../../../../hooks/pageFixture";
import InventoryPage from "../../../../pages//appSauceDemo/inventoryPage";
import CartPage from "../../../../pages//appSauceDemo/cartPage";

let inventoryPage: InventoryPage;
let cartPage: CartPage;

When('I add the product {string} to the cart', async function (name) {
  // Write code here that turns the phrase above into concrete actions
  inventoryPage = new InventoryPage(fixture.page);
  await inventoryPage.isLoaded();
  await inventoryPage.addProductToCartByName(name);
});

Then('the cart badge should show {int}', async function (count) {
  const badgeCount = await inventoryPage.getCartBadgeCount();
  expect(badgeCount).toBe(count);
});


When('I open the cart', async function () {
    await inventoryPage.openCart();
    cartPage = new CartPage(fixture.page);
    cartPage.isLoaded();
});

Then('the cart should contain {string}', async function (name) {
  const itemNames = await cartPage.itemNames();
  expect(itemNames).toContain(name);
});