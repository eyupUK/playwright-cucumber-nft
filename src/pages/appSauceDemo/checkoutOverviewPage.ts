import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";



export default class CheckoutOverviewPage extends BasePage{

    constructor( page: Page) {
        super(page);
    }


    private readonly Elements = {
        title: this.page.locator('.title'),
        finishBtn: this.page.locator('#finish'),
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await expect(this.Elements.title).toBeVisible();
        await expect(this.Elements.title).toHaveText('Checkout: Overview');
        return true;
    }

    async finish() {
        await this.Elements.finishBtn.click();
    }

}