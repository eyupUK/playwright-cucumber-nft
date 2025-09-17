import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { BasePage } from "./base.page";

export default class CartPage extends BasePage{
    private base: PlaywrightWrapper;

    constructor( page: Page) {
        super(page);
        this.base = new PlaywrightWrapper(page);
    }


    private Elements = {
        cartTitle: ".title",
        cartItems: ".cart_item",
        checkoutBtn: "#checkout",
        itemName: ".inventory_item_name",
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await this.page.waitForLoadState();
        await expect(this.page.locator(this.Elements.cartTitle)).toBeVisible({ timeout: 5000 });
        return true;
    }

    async itemNames(): Promise<string[]> {
        const itemNames: string[] = [];
        const items = this.page.locator(this.Elements.cartItems);
        for (let i = 0; i < await items.count(); i++) {
            const name = await items.nth(i).locator(this.Elements.itemName).textContent();
            if (name) itemNames.push(name);
        }
        console.log(`All item names: ${itemNames.join(", ")}`);
        return itemNames;
    }
    async proceedToCheckout() {
        await this.page.locator(this.Elements.checkoutBtn).click();
        console.log("Proceeded to checkout");
    }
}