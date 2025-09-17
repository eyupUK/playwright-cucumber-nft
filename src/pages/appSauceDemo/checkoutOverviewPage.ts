import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { BasePage } from "./base.page";



export default class CheckoutOverviewPage extends BasePage{
    private base: PlaywrightWrapper;

    constructor( page: Page) {
        super(page);
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