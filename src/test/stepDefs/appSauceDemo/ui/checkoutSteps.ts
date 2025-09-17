import { Given, When, Then, setDefaultTimeout } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import InventoryPage from "../../../../pages/appSauceDemo/inventoryPage";
import CheckoutInfoPage from "../../../../pages/appSauceDemo/checkoutInfoPage";
import CheckoutCompletePage from "../../../../pages/appSauceDemo/checkoutCompletePage";
import CheckoutOverviewPage from "../../../../pages/appSauceDemo/checkoutOverviewPage";
import CartPage from "../../../../pages/appSauceDemo/cartPage";

setDefaultTimeout(60 * 1000);

let inventoryPage: InventoryPage;
let checkoutInfoPage: CheckoutInfoPage;
let checkoutCompletePage: CheckoutCompletePage;
let checkoutOverviewPage: CheckoutOverviewPage;
let cartPage: CartPage;



When('I add {string} to my cart and start checkout', async function (this: any, name) {
  inventoryPage = new InventoryPage(this.page);
  expect( await inventoryPage.isLoaded()).toBeTruthy();
  await inventoryPage.addProductToCartByName(name);
  await inventoryPage.openCart();
  cartPage = new CartPage(this.page);
  const cart = await cartPage.isLoaded();
  expect(cart).toBeTruthy();
  await cartPage.proceedToCheckout();
  checkoutInfoPage = new CheckoutInfoPage(this.page);
  expect( await checkoutInfoPage.isLoaded()).toBeTruthy();
});


When('I provide checkout details {string} , {string} , {string} and continue', async function (fname, lname, zip) {
  await checkoutInfoPage.fillInfo(fname, lname, zip);
  await checkoutInfoPage.continueToOverview();
});


When('I finish the checkout', async function (this: any) {
  checkoutOverviewPage = new CheckoutOverviewPage(this.page);
  expect( await checkoutOverviewPage.isLoaded()).toBeTruthy();
  await checkoutOverviewPage.finish();
});

Then('I should see the order completion page', async function (this: any) {
  checkoutCompletePage = new CheckoutCompletePage(this.page);
  expect( await checkoutCompletePage.isLoaded()).toBeTruthy();
});