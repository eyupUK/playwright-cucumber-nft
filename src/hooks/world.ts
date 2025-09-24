import { IWorld } from '@cucumber/cucumber';
import {
  chromium, firefox, webkit,
  Browser, BrowserContext, Page,
  devices, request, APIRequestContext,
} from '@playwright/test';
import path from 'node:path';
import { options } from "../helper/util/logger";


export type WorldParams = {
  scenarioName?: string;
  // UI
  browser?: 'chromium' | 'firefox' | 'webkit';
  device?: keyof typeof devices;
  storageState?: string;
  headless?: boolean;
  // API
  isApiOnly?: boolean;
  baseURL?: string;
  defaultHeaders?: Record<string, string>;
  logger?: any;
};

export class PWWorld implements IWorld{
  [key: string]: any;
  attach: any;
  log: any;
  link: any;
  parameters: any;
  browser?: Browser;
  context?: BrowserContext;
  page?: Page;

  api?: APIRequestContext;

  async init(params: WorldParams = {}) {
    this.logger = options(params.scenarioName, "debug");
    if (params.isApiOnly) {
      this.api = await request.newContext({
        baseURL: params.baseURL,
        extraHTTPHeaders: params.defaultHeaders,
      });
      return;
    }

    const launcher = { chromium, firefox, webkit }[params.browser ?? 'chromium'];
    this.browser = await launcher.launch({ headless: params.headless ?? true });

    const devicePreset = params.device ? devices[params.device] : undefined;

    this.context = await this.browser.newContext({
      ...(devicePreset ?? {}),
      storageState: params.storageState ? path.resolve(params.storageState) : undefined,
      ignoreHTTPSErrors: true,
      recordVideo: {
        dir: path.resolve(`test-results`, `videos`, `${params.scenarioName}`),
        size: devicePreset?.viewport,
      },
    });

    this.page = await this.context.newPage();
  }

  async dispose() {
    await this.page?.close();
    await this.context?.close();
    await this.browser?.close();
    await this.api?.dispose();
  }
}
