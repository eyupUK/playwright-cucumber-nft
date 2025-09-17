import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { BasePage } from "./base.page";


export default class InventoryPage extends BasePage {
    private base: PlaywrightWrapper;

    constructor(page: Page) {
        super(page);
        this.base = new PlaywrightWrapper(page);
    }


    private Elements = {
        cartBadge: "span[data-test='shopping-cart-badge']",
        cartLink: "a[data-test='shopping-cart-link']",
        inventoryItem: ".inventory_item",
        productNames: ".inventory_item_name",
        sortSelect: "[data-test='product-sort-container']",
        priceLabel: ".inventory_item_price",
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await this.page.waitForLoadState();
        await expect(this.page.locator(this.Elements.inventoryItem).first()).toBeVisible({ timeout: 5000 });
        console.log("Inventory page loaded");
        return true;
    }

    async addProductToCartByName(name: string) {
        const product = this.page.locator(this.Elements.inventoryItem).filter({ hasText: name });
        await product.locator("button").click();
        console.log(`Product added to cart: ${name}`);
    }

    async getCartBadgeCount(): Promise<number> {
        await this.page.waitForSelector(this.Elements.cartBadge, { timeout: 2000 }).catch(() => {});
        const badge = this.page.locator(this.Elements.cartBadge);
        if (await badge.isVisible()) {
            const countText = await badge.textContent();
            const count = countText ? parseInt(countText) : 0;
            console.log(`Cart badge count: ${count}`);
            return count;
        }
        console.log("Cart badge not visible, count is 0");
        return 0;
    }

    async openCart() {
        await this.page.locator(this.Elements.cartLink).click();
        console.log("Navigated to cart page");
    }

    async getAllProductNames(): Promise<string[]> {
        const productNames: string[] = [];
        const names = this.page.locator(this.Elements.productNames);
        for (let i = 0; i < await names.count(); i++) {
            const name = await names.nth(i).innerText();
            if (name) productNames.push(name);
        }
        console.log(`All product names: ${productNames.join(", ")}`);
        return productNames;
    }

    async sortByVisibleText(option: string) {
        await this.page.locator(this.Elements.sortSelect).selectOption({ label: option });
        console.log(`Sorted by: ${option}`);
    }

    async getAllPricesInOrder(): Promise<number[]> {
        const prices: number[] = [];
        const priceElements = this.page.locator(this.Elements.priceLabel);
        for (let i = 0; i < await priceElements.count(); i++) {
            const priceText = await priceElements.nth(i).textContent();
            if (priceText) {
                const price = parseFloat(priceText.replace('$', ''));
                prices.push(price);
            }
        }
        console.log(`All prices in order: ${prices.join(", ")}`);
        return prices;
    }

}