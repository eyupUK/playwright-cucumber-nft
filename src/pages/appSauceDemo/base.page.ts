import { Locator, Page } from '@playwright/test';

export abstract class BasePage {
  protected page: Page;
  protected baseUrl: string;

  constructor(page: Page) {
    this.page = page;
    this.baseUrl = process.env.BASEURL || '';
  }

  // Navigation methods
  async goto(url: string = this.baseUrl): Promise<void> {
    await this.page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
  }

  async reload(): Promise<void> {
    await this.page.reload({ waitUntil: 'domcontentloaded' });
  }

  async goBack(): Promise<void> {
    await this.page.goBack({ waitUntil: 'domcontentloaded' });
  }

  async goForward(): Promise<void> {
    await this.page.goForward({ waitUntil: 'domcontentloaded' });
  }

  // Wait methods
  async waitForElement(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({
      state: 'visible',
      timeout: timeout,
    });
  }

  async waitForElementToBeHidden(locator: Locator, timeout: number = 10000): Promise<void> {
    await locator.waitFor({
      state: 'hidden',
      timeout: timeout,
    });
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('networkidle');
  }

  async waitForUrl(url: string | RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }

  // Click methods
  async click(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click();
  }

  async doubleClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.dblclick();
  }

  async rightClick(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.click({ button: 'right' });
  }

  async clickNth(locator: Locator, index: number): Promise<void> {
    await this.waitForElement(locator.nth(index));
    await locator.nth(index).click();
  }

  // Input methods
  async fill(locator: Locator, text: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.fill(text);
  }

  async type(locator: Locator, text: string, delay?: number): Promise<void> {
    await this.waitForElement(locator);
    await locator.clear();
    await locator.type(text, { delay });
  }

  async pressKey(locator: Locator, key: string): Promise<void> {
    await this.waitForElement(locator);
    await locator.press(key);
  }

  // Selection methods
  async selectOption(locator: Locator, option: string | string[]): Promise<void> {
    await this.waitForElement(locator);
    await locator.selectOption(option);
  }

  async check(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    if (!(await locator.isChecked())) {
      await locator.check();
    }
  }

  async uncheck(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    if (await locator.isChecked()) {
      await locator.uncheck();
    }
  }

  // Text and attribute methods
  async getText(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.innerText();
  }

  async getTextContent(locator: Locator): Promise<string | null> {
    await this.waitForElement(locator);
    return await locator.textContent();
  }

  async getValue(locator: Locator): Promise<string> {
    await this.waitForElement(locator);
    return await locator.inputValue();
  }

  async getAttribute(locator: Locator, attribute: string): Promise<string | null> {
    await this.waitForElement(locator);
    return await locator.getAttribute(attribute);
  }

  // Visibility and state methods
  async isVisible(locator: Locator): Promise<boolean> {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  async isHidden(locator: Locator): Promise<boolean> {
    try {
      return await locator.isHidden();
    } catch {
      return true;
    }
  }

  async isEnabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isEnabled();
    } catch {
      return false;
    }
  }

  async isDisabled(locator: Locator): Promise<boolean> {
    try {
      return await locator.isDisabled();
    } catch {
      return true;
    }
  }

  async isChecked(locator: Locator): Promise<boolean> {
    try {
      return await locator.isChecked();
    } catch {
      return false;
    }
  }

  // Count methods
  async getCount(locator: Locator): Promise<number> {
    return await locator.count();
  }

  // Scroll methods
  async scrollIntoView(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async scrollToTop(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom(): Promise<void> {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  // Hover methods
  async hover(locator: Locator): Promise<void> {
    await this.waitForElement(locator);
    await locator.hover();
  }

  // Screenshot methods
  async takeScreenshot(name?: string): Promise<any> {
    const screenshotPath = name ? `screenshots/${name}.png` : undefined;
    return await this.page.screenshot({ path: screenshotPath, fullPage: true });
  }

  async takeElementScreenshot(locator: Locator, name?: string): Promise<any> {
    await this.waitForElement(locator);
    const screenshotPath = name ? `screenshots/${name}.png` : undefined;
    return await locator.screenshot({ path: screenshotPath });
  }

  // Utility methods
  async sleep(seconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async getTitle(): Promise<string> {
    return await this.page.title();
  }

  async dragAndDrop(source: Locator, target: Locator): Promise<void> {
    await this.waitForElement(source);
    await this.waitForElement(target);
    await source.dragTo(target);
  }

  // File handling methods
  async uploadFile(locator: Locator, filePath: string | string[]): Promise<void> {
    await this.waitForElement(locator);
    await locator.setInputFiles(filePath);
  }

  async downloadFile(locator: Locator): Promise<string> {
    const [download] = await Promise.all([this.page.waitForEvent('download'), this.click(locator)]);
    const downloadPath = await download.path();
    return downloadPath || '';
  }

  // Alert handling methods
  async acceptAlert(): Promise<void> {
    this.page.on('dialog', async (dialog: any) => {
      await dialog.accept();
    });
  }

  async dismissAlert(): Promise<void> {
    this.page.on('dialog', async (dialog: any) => {
      await dialog.dismiss();
    });
  }

  async getAlertText(): Promise<string> {
    return new Promise((resolve) => {
      this.page.on('dialog', async (dialog: any) => {
        resolve(dialog.message());
        await dialog.accept();
      });
    });
  }

  // Frame handling methods
  async switchToFrame(frameLocator: string): Promise<void> {
    this.page.frameLocator(frameLocator);
  }

  // Cookie methods
  async getCookies(): Promise<any[]> {
    return await this.page.context().cookies();
  }

  async setCookie(name: string, value: string, domain?: string): Promise<void> {
    await this.page.context().addCookies([
      {
        name,
        value,
        domain: domain || new URL(this.page.url()).hostname,
        path: '/',
      },
    ]);
  }

  async clearCookies(): Promise<void> {
    await this.page.context().clearCookies();
  }

  // Local storage methods
  async setLocalStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ key, value }: { key: string; value: string }) => localStorage.setItem(key, value),
      { key, value },
    );
  }

  async getLocalStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((key: string) => localStorage.getItem(key), key);
  }

  async clearLocalStorage(): Promise<void> {
    await this.page.evaluate(() => localStorage.clear());
  }

  // Session storage methods
  async setSessionStorage(key: string, value: string): Promise<void> {
    await this.page.evaluate(
      ({ key, value }: { key: string; value: string }) => sessionStorage.setItem(key, value),
      { key, value },
    );
  }

  async getSessionStorage(key: string): Promise<string | null> {
    return await this.page.evaluate((key: string) => sessionStorage.getItem(key), key);
  }

  async clearSessionStorage(): Promise<void> {
    await this.page.evaluate(() => sessionStorage.clear());
  }
}
