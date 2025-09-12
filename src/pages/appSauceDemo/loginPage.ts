import { expect, Locator, Page } from "@playwright/test";
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";
import { faker } from '@faker-js/faker';
import { fixture } from "../../hooks/pageFixture";


export default class LoginPage {

    private base: PlaywrightWrapper;

    constructor(private page: Page) {
        this.base = new PlaywrightWrapper(page);
    }


    private Elements = {
        // Matter Type
        username: "#user-name", // might be parameterized
        password: "#password", // might be parameterized
        login: "#login-button",
        errorMsg: "h3[data-test='error']"
    }

    getElements(){
        return this.Elements;
    }

    async getTitle() {
        return this.page.locator('.title').innerText();
    }

    async navigateToLoginPage() {
        await this.page.goto(process.env.BASEURL || "https://www.saucedemo.com/");
        await this.page.waitForLoadState();
        console.log("navigated to login page");
        fixture.logger.info("navigated to login page");
    }

    async fillLogin(username: string, password: string) {
        await this.page.waitForLoadState();
        await this.page.locator(this.Elements.username).fill(username);
        await this.base.fillText(this.Elements.password, password);
        console.log("login filled");
        fixture.logger.info("login filled");
    }

    async clickLogin() {
        await this.page.locator(this.Elements.login).click();
        console.log("Login clicked");
        fixture.logger.info("Login clicked");
    }

    async getErrorMessage() {
        return this.page.locator(this.Elements.errorMsg).innerText();
    }

}