import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import InventoryPage from "../../../../pages//appSauceDemo/inventoryPage";
import CartPage from "../../../../pages//appSauceDemo/cartPage";

let inventoryPage: InventoryPage;
let cartPage: CartPage;

When('I add the product {string} to the cart', async function (this: any, name) {
  // Write code here that turns the phrase above into concrete actions
  inventoryPage = new InventoryPage(this.page);
  await inventoryPage.isLoaded();
  await inventoryPage.addProductToCartByName(name);
});

Then('the cart badge should show {int}', async function (count) {
  const badgeCount = await inventoryPage.getCartBadgeCount();
  expect(badgeCount).toBe(count);
});


When('I open the cart', async function (this: any) {
    await inventoryPage.openCart();
    cartPage = new CartPage(this.page);
    await cartPage.isLoaded();
});

Then('the cart should contain {string}', async function (name) {
  expect(await cartPage.itemNames()).toContain(name);
});