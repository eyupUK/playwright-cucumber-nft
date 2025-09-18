// src/hooks/hooks.ts
import {
  Before,
  After,
  ITestCaseHookParameter,
  Status,
  setDefaultTimeout,
  setWorldConstructor,
  BeforeAll,
} from '@cucumber/cucumber';
import { devices } from '@playwright/test';
import { PWWorld } from './world';
import { getEnv } from '../helper/env/env';
import path from 'node:path';
const fs = require("fs-extra");

type BrowserName = 'chromium' | 'firefox' | 'webkit';
type DeviceName = keyof typeof devices;

// Ensure Cucumber uses our World class (do this once, in one place)
setWorldConstructor(PWWorld);


// ---- hooks ----
BeforeAll(async function () {
  getEnv();
  console.log("Env set BEFORE all tests");
});

Before(async function (this: PWWorld, { pickle }: ITestCaseHookParameter) {
  const tags = tagMap(pickle);
  const scenarioName = (pickle.name + "_" + pickle.id).replace(/[^a-zA-Z0-9-_]/g, "_");

  // timeouts
  const tagTimeout = parseTimeoutMs(String(tags.get('@timeout') || ''));
  const defaultMs = tagTimeout ?? (tags.has('@slow') ? 120_000 : 30_000);
  //setDefaultTimeout(defaultMs);

  // @api scenarios: no browser/page
  if (tags.has('@api')) {
    await this.init({
      isApiOnly: true,
      baseURL: (process.env.BASE_URL as string | undefined) || undefined,
      defaultHeaders: { 'Content-Type': 'application/json' },
    });
    return;
  }

  // UI scenarios
  const browserTag = tags.get('@browser');
  const browser = isBrowserName(browserTag) ? browserTag : undefined;

  const mobileTag = tags.get('@mobile');
  const device = isDeviceName(mobileTag) ? (mobileTag as DeviceName) : undefined;

  const storageState = tags.has('@auth') ? 'storage/authState.json' : undefined;

  await this.init({
    scenarioName,
    browser,
    device,
    storageState,
    headless: process.env.HEAD === 'true' ? false : true,
  });

  // Apply Playwright defaults for this scenario
  this.page?.setDefaultTimeout(defaultMs);
  this.page?.setDefaultNavigationTimeout(defaultMs);
});

After(async function (this: PWWorld, { result, pickle }: ITestCaseHookParameter) {
  const failed = result?.status !== Status.PASSED;

  // If API-only, there is no page
  if (!this.page) {
    await this.dispose();
    return;
  }


  if (failed) {
    const scenarioName = (pickle.name + '_' + pickle.id).replace(/[^a-zA-Z0-9-_]/g, '_');
    
    const buffer = await this.page.screenshot({ fullPage: true, path: `test-results/screenshots/${scenarioName}_failed.png`, type: 'png' });

    //  Attach to Cucumber (shows in reports that support embeddings)
    await this.attach?.(buffer, 'image/png');
  }
  else {
    let videoPath: string | any = this.page.video() ? await this.page.video()?.path() : null;
    // delete the video if the scenario is passed
    if (videoPath) {
      fs.unlink(videoPath);
    }
  }
  await this.dispose();
});



// ---- helpers ----
function tagMap(pickle: ITestCaseHookParameter['pickle']) {
  const map = new Map<string, string | true>();
  for (const t of pickle.tags) {
    const i = t.name.indexOf('=');
    if (i > -1) map.set(t.name.slice(0, i).trim(), t.name.slice(i + 1).trim());
    else map.set(t.name.trim(), true);
  }
  return map;
}
function isBrowserName(v: unknown): v is BrowserName {
  return v === 'chromium' || v === 'firefox' || v === 'webkit';
}
function isDeviceName(v: unknown): v is DeviceName {
  return typeof v === 'string' && v in devices;
}
function parseTimeoutMs(s?: string): number | undefined {
  if (!s) return undefined;
  const m = s.trim().toLowerCase().match(/^(\d+)(ms|s|m)?$/);
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2] ?? 'ms';
  return unit === 'ms' ? n : unit === 's' ? n * 1000 : n * 60000;
}