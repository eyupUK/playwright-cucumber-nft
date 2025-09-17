import { Page, BrowserContext } from '@playwright/test';
import { chromium, firefox, webkit, devices } from 'playwright';
import { options } from '../helper/util/logger';
import { IWorld, World } from '@cucumber/cucumber';

export class PWWorld implements IWorld {
  [key: string]: any;
  log: any;
  link!: World['link'];
  parameters: any;
  page?: Page;
  context?: BrowserContext;
  logger!: ReturnType<typeof options>;
  attach!: World['attach'];

  async init(config: {
    browser?: string;
    device?: keyof typeof devices;
    storageState?: string;
    headless?: boolean;
    scenarioName: string;
    recordVideo?: { dir: string; size: { width: number; height: number } };
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
  }) {
    // initialize logger first so subsequent logs are safe
    this.logger = options(config.scenarioName, 'debug');

    const browserMap: Record<string, import('playwright').BrowserType<any>> = {
      chromium,
      firefox,
      webkit,
    };
    const browserKey = (config.browser ?? 'chromium') as string;
    const browserType = browserMap[browserKey] ?? chromium;

    const browser = await browserType.launch({
      headless: config.headless,
    });
    this.logger.info('Launched browser');

    const device = config.device ? devices[config.device] : undefined;
    if (device) {
      this.logger.info(`Using device: ${config.device}`);
    }

    this.context = await browser.newContext({
      ...device,
      storageState: config.storageState,
      recordVideo: config.recordVideo,
      baseURL: config.baseURL,
      extraHTTPHeaders: config.defaultHeaders,
    });

    if (this.context) {
      this.logger.info('Created new browser context');
    }
    this.page = await this.context.newPage();
    if (this.page) {
      this.logger.info('New page created');
    }
    this.logger.info(`Initialized browser for scenario: ${config.scenarioName}`);
  }

  async dispose() {
    await this.page?.close();
    await this.context?.close();
    this.logger.info('Disposed browser and context');
  }
}