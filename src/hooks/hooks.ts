import {
  Before,
  After,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout,
  BeforeAll,
  AfterAll,
} from '@cucumber/cucumber';
import { devices } from '@playwright/test';
import { PWWorld } from './world';
import { options } from '../helper/util/logger';
import fs from 'fs';
import { console } from 'inspector';

type DeviceName = keyof typeof devices;

function parseTagMap(pickle: ITestCaseHookParameter['pickle']) {
  const map = new Map<string, string | true>();
  const tags = pickle.tags || [];
  for (const t of tags) {
    const i = t.name.indexOf('=');
    if (i > -1) map.set(t.name.slice(0, i).trim(), t.name.slice(i + 1).trim());
    else map.set(t.name, true);
  }
  return map;
}

BeforeAll(() => {
  setDefaultTimeout(60 * 1000);
});

AfterAll(() => {
  // Cleanup logic after all tests
});

Before(async function (this: PWWorld, { pickle }: ITestCaseHookParameter) {
  const tags = parseTagMap(pickle);
  const scenarioName = pickle.name.replace(/[^a-zA-Z0-9-_]/g, '_');
  this.logger = options(scenarioName, 'debug');
  this.logger.info(`Starting scenario: ${pickle.name}`);

  const isApiOnly = tags.has('@api');
  const baseURL = process.env.BASE_URL || (tags.get('@base') as string) || undefined;
  const defaultMs = tags.has('@slow') ? 120_000 : 30_000;
  setDefaultTimeout(defaultMs);

  if (isApiOnly) {
    this.logger.info('Initializing API-only scenario');
    this.isApiOnly = true;
    await this.init({
      baseURL,
      defaultHeaders: {
        'Content-Type': 'application/json',
        ...(process.env.API_TOKEN ? { Authorization: `Bearer ${process.env.API_TOKEN}` } : {}),
      },
      scenarioName,
    });
    return;
  }

  const browserTag = tags.get('@browser');
  this.logger.info(`Browser tag: ${browserTag}`);
  this.logger.info(`Browser : ${process.env.BROWSER}`);
  const browser: string = typeof browserTag === 'string' ? browserTag : process.env.BROWSER || 'chromium';

  this.logger.info(`Browser: ${browser}`);

  const mobileTag = tags.get('@mobile');
  const device: DeviceName | undefined = typeof mobileTag === 'string' && mobileTag in devices
    ? (mobileTag as DeviceName)
    : undefined;

  const storageState = tags.has('@auth') ? 'storage/authState.json' : undefined;

  this.logger.info('Initializing browser and context');
  await this.init({
    browser,
    device,
    storageState,
    headless: process.env.HEAD === 'false' ? false : true,
    recordVideo: {
      dir: 'test-results/videos',
      size: { width: 1280, height: 720 },
    },
    scenarioName,
  });

  this.logger.info('Browser and context being initialized...');

  this.page?.setDefaultTimeout(defaultMs);
  this.page?.setDefaultNavigationTimeout(defaultMs);

  this.logger.info('Browser and context initialized');
});

After(async function (this: PWWorld, { result }: ITestCaseHookParameter) {
  const failed = result?.status !== Status.PASSED;

  if (!this.page) {
    this.logger.info('Disposing API-only scenario');
    await this.dispose();
    return;
  }

  if (failed) {
    this.logger.error('Scenario failed, capturing screenshot and video');
    const screenshot = await this.page.screenshot({ fullPage: true });
    await this.attach?.(screenshot, 'image/png');

    const videoPath = this.page ? await this.page.video()?.path() : undefined;
    if (videoPath) {
      const videoBuffer = fs.readFileSync(videoPath);
      await this.attach?.(videoBuffer, 'video/webm');
    } else {
      this.logger.warn('No video recorded for this scenario.');
    }
  }

  this.logger.info('Disposing browser and context');
  await this.dispose();
});