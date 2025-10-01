import { expect, Page } from "@playwright/test";
import { BasePage } from "./base.page";



export default class CheckoutCompletePage extends BasePage {


    constructor(page: Page) {
        super(page);
    }

    private readonly Elements = {
        completeHeader: this.page.locator('.complete-header'),
        backHomeBtn: this.page.locator('#back-to-products'),
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await expect(this.Elements.completeHeader).toBeVisible();
        await expect(this.Elements.completeHeader).toHaveText('Thank you for your order!');
        return true;
    }

    async backHome() {
        await this.Elements.backHomeBtn.click();
    }

    

}