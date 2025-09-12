import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { fixture } from "../../hooks/pageFixture";



export default class CheckoutOverviewPage {
    private base: PlaywrightWrapper;

    constructor(private page: Page) {
        this.base = new PlaywrightWrapper(page);
    }


    private Elements = {
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