import { Locator, Page } from "@playwright/test";

export default class PlaywrightWrapper {
  constructor(private page: Page) { }

  async goto(url: string) {
    await this.page.goto(url, {
      waitUntil: "domcontentloaded"
    });
  }

  async waitAndClickOnElement(locator: string) {
    const element = this.page.locator(locator);
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.click();
  }

  async waitAndClickOnElementNthByLocator(locator: Locator, nth: number) {
    const element = locator.nth(nth);
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.click();
  }

  async waitAndGetElementNthByLocator(locator: Locator, nth: number) {
    const element = locator.nth(nth);
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element;
  }

  async waitAndClickOnElementNth(locator: string, nth: number) {
    const element = this.page.locator(locator).nth(nth);
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.click();
  }

  async waitAndClickByLocator(locator: Locator) {
    const element = locator;
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.click();
  }

  async navigateTo(link: string) {
    await Promise.all([this.page.waitForURL(link), this.page.click(link)]);
  }

  async fillText(locator: string, text: string) {
    const element = this.page.locator(locator);
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.fill(text);
  }

  async fillTextByLocator(locator: Locator, text: string) {
    const element = locator;
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    await element.fill(text);
  }

  async waitForSelector(selector: string) {
    await this.page.waitForSelector(selector, { state: "visible" });
    console.log(`Element located: ${ selector }`);
  }
  async waitAndFillBySelector(selector: string, text: string) {
    await this.waitForSelector(selector);
    const element = this.page.locator(selector);
    await element.fill(text);
  }

  async countOfElements(locator: string) {
    return await this.page.locator(locator).count();
  }

  async getElementText(locator: string) {
    const element = await this.page.locator(locator);
    await element.waitFor({
      state: "visible",
      timeout: 5000
    });
    return await element.innerText();
  }

  async getElementTextByLocator(locator: Locator) {
    const element = locator;
    await element.waitFor({
      state: "visible",
      timeout: 10000
    });
    return await element.innerText();
  }

  async isElementVisible(locator: string) {
    return await this.page.locator(locator).first().isVisible();
  }

  async sleep(second: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, second * 1000));
  }

  async waitForIdle(page: Page) {
    await this.page.waitForLoadState("domcontentloaded");
    await this.page.waitForLoadState("load");
    await this.page.waitForLoadState("networkidle");
  };


}