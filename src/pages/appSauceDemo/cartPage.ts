import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";

export default class CartPage extends BasePage{

    constructor( page: Page) {
        super(page);
    }


    private readonly Elements = {
        cartTitle: this.page.locator(".title"),
        cartItems: this.page.locator(".cart_item"),
        checkoutBtn: this.page.locator("#checkout"),
        itemName: this.page.locator(".inventory_item_name"),
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await this.page.waitForLoadState();
        await expect(this.Elements.cartTitle).toBeVisible({ timeout: 5000 });
        return true;
    }

    async itemNames(): Promise<string[]> {
        const itemNames: string[] = [];
        const items = this.Elements.cartItems;
        for (let i = 0; i < await items.count(); i++) {
            const name = await items.nth(i).locator(this.Elements.itemName).textContent();
            if (name) itemNames.push(name);
            else itemNames.pop();
        }
        console.log(`All item names: ${itemNames.join(", ")}`);
        return itemNames;
    }
    async proceedToCheckout() {
        await this.Elements.checkoutBtn.click();
        console.log("Proceeded to checkout");
    }
}