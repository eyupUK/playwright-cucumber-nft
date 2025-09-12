import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { fixture } from "../../hooks/pageFixture";



export default class CheckoutCompletePage {
    private base: PlaywrightWrapper;

    constructor(private page: Page) {
        this.base = new PlaywrightWrapper(page);
    }


    private Elements = {
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