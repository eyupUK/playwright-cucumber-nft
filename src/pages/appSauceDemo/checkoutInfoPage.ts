import { expect, Locator, Page } from "@playwright/test";
import { BasePage } from "./base.page";


export default class CheckoutInfoPage extends BasePage {

    constructor( page: Page) {
        super(page);    
    }

    private readonly Elements = {
        title: this.page.locator('.title'),
        firstName: this.page.locator('#first-name'),
        lastName: this.page.locator('#last-name'),
        postalCode: this.page.locator('#postal-code'),
        continueBtn: this.page.locator('#continue'),
    }

    getElements(){
        return this.Elements;
    }

    async isLoaded() {
        await expect(this.Elements.title).toBeVisible();
        await expect(this.Elements.title).toHaveText('Checkout: Your Information');
        return true;
    }

    async fillInfo(firstName: string, lastName: string, postalCode: string) {
        await this.Elements.firstName.fill(firstName);
        await this.Elements.lastName.fill(lastName);
        await this.Elements.postalCode.fill(postalCode);
    }

    async continueToOverview() {
        await this.Elements.continueBtn.click();
    }

}