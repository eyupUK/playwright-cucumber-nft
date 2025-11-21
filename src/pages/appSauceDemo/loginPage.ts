import { Page } from "@playwright/test";
import { BasePage } from "./base.page";


export default class LoginPage extends BasePage{
    constructor(page: Page) {
        super(page);
    }


    private readonly Elements = {
        username: this.page.locator("#user-name"),
        password: this.page.locator("#password"),
        login: this.page.locator("#login-button"),
        errorMsg: this.page.locator("h3[data-test='error']")
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
    }

    async fillLogin(username: string, password: string) {
        await this.page.waitForLoadState();
        await this.Elements.username.fill(username);
        await this.Elements.password.fill(password);
        console.log("login filled");
    }

    async clickLogin() {
        await this.Elements.login.click();
        console.log("Login clicked");
    }

    async getErrorMessage() {
            return this.Elements.errorMsg.innerText();
    }

}