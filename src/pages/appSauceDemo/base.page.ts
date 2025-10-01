import { Page, expect, Locator } from '@playwright/test';
import PlaywrightWrapper from "../../helper/wrapper/PlaywrightWrapper";


export abstract class BasePage {
  protected readonly page: Page;
  protected readonly base: PlaywrightWrapper;
  constructor(page: Page) { this.page = page; this.base = new PlaywrightWrapper(page); }

  async goto(path: string) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.waitForNetworkIdle();
  }

  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectVisible(locator: Locator) {
    await expect(locator).toBeVisible();
  }

  async expectUrlContains(fragment: string) {
    await expect(this.page).toHaveURL(new RegExp(fragment));
  }


  async clickWithRetry(locator: Locator, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        await locator.click();
        return;
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await this.page.waitForTimeout(1000);
      }
    }
  }
}