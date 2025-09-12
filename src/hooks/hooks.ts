import { BeforeAll, AfterAll, Before, After, Status, BeforeStep, AfterStep } from "@cucumber/cucumber";
import { Browser, BrowserContext } from "@playwright/test";
import { fixture } from "./pageFixture";
import { invokeBrowser, browserType } from "../helper/browsers/browserManager";
import { getEnv } from "../helper/env/env";
import { options } from "../helper/util/logger";
const fs = require("fs-extra");

let browser: Browser;
let context: BrowserContext;
let environment: string;

BeforeAll(async function () {
    environment = getEnv();
    console.log("Env set BEFORE all tests");
});

Before({ tags: '@api' }, async function ({ pickle }) {
    console.log("API Scenario: " + pickle.name);
    fixture.logger = options(pickle.name, "debug");
    fixture.logger.info("Environment set to: " + environment);
    fixture.logger.info("API Scenario: " + pickle.name);
});

// It will trigger for non api scenarios
Before({ tags: "not @api" }, async function ({ pickle }) {
    console.log("Scenario: " + pickle.name);
    console.log("Browser is set BEFORE for non-api scenarios");
    browser = await invokeBrowser();

    // Save the browser info to a file
    const browserInfo = {
        name: browser.browserType().name(),
        version: browser.version(),
    };
    fs.writeFileSync("browser-info.json", JSON.stringify(browserInfo, null, 2));

    console.log("Browser is set to " + browserType);
    console.log("Scenario: " + pickle.name);
    const scenarioName = (pickle.name + "_" + pickle.id).replace(/[^a-zA-Z0-9-_]/g, "_")
    context = await browser.newContext({
        // viewport: { width: 2560, height: 1343 },
        recordVideo: {
            dir: "test-results/videos"
            // size: { width: 2560, height: 1343 }
        }
    });
    await context.tracing.start({
        name: scenarioName,
        title: pickle.name,
        sources: true,
        screenshots: true, snapshots: true
    });

    const page = await context.newPage();

    fixture.page = page;

    fixture.logger = options(scenarioName, "debug");

    fixture.logger.info("Environment set to: " + environment);
    fixture.logger.warn("Browser is set to " + browserType);
    fixture.logger.debug(`Before Scenario: ${pickle.name}`);
});

After({ tags: 'not @api' }, async function ({ pickle, result }) {
    console.log("AFTER block is triggered");
    const scenarioName = (pickle.name + "_" + pickle.id).replace(/[^a-zA-Z0-9-_]/g, "_")
    const path = `./test-results/trace/${scenarioName}.zip`;

    // Screenshots and Video records when the scenario failed ONLY
    if (result?.status == Status.FAILED) {
        console.log("this scenario failed at this step");
        fixture.logger.info("Attachments are being processed in AFTER this scenario failed");
        let videoPath: string | any = fixture.page.video() ? await fixture.page.video()?.path() : null;
        if (videoPath) {
            this.attach(fs.readFileSync(videoPath), 'video/webm');
        }

        await context.tracing.stop({ path: path });
        this.attach(fs.readFileSync(videoPath), 'video/webm');
        let img: Buffer;
        img = await fixture.page.screenshot(
            { path: `./test-results/screenshots/${pickle.name.replace(/[^a-zA-Z0-9-_]/g, "_")}/failed_step.png`, type: "png" });
        await this.attach(img, "image/png");
    }

    // Attachments for all scenarios
    const bashCommandTrace = `npx playwright show-trace ${path}`;
    const traceFileLink = `<a href="https://trace.playwright.dev/" > Open ${path} </a>`
    this.attach(`Trace file: ${traceFileLink}`, 'text/html');
    this.attach(`Command for Trace File: ${bashCommandTrace}`, 'text/html');
    console.log("Attachments processed AFTER non-api scenarios");

    // Log info
    fixture.logger.info(`After Scenario: ${pickle.name}`);
    fixture.logger.info(`Scenario Status: ${result?.status}`);
    fixture.logger.info(`Scenario Duration in Seconds: ${result?.duration.seconds}`);
    fixture.logger.info(`Scenario Tags: ${pickle.tags.map(tag => tag.name)}`);
    fixture.logger.info(`Scenario Steps: ${pickle.steps.map(step => step.text)}`);
    await fixture.page.close();
    await context.close();

    // close browser
    console.log("After this SCENARIO");
    if (browser !== null && browser !== undefined) {
        await browser.close();
        console.log("Browser closed");
    }
});

After({ tags: '@api' }, async function ({ pickle, result }) {
    console.log("AFTER block is triggered for API scenarios");
    // Log info
    fixture.logger.info(`After Scenario: ${pickle.name}`);
    fixture.logger.info(`Scenario Status: ${result?.status}`);
    fixture.logger.info(`Scenario Duration in Seconds: ${result?.duration.seconds}`);
    fixture.logger.info(`Scenario Tags: ${pickle.tags.map(tag => tag.name)}`);
    fixture.logger.info(`Scenario Steps: ${pickle.steps.map(step => step.text)}`);
});

AfterAll(async function () {
    console.log("After All scenarios");
    // close browser
    if (browser !== null && browser !== undefined) {
        await browser.close();
        console.log("Browser closed");
    }
});


BeforeStep(async function ({ pickleStep }) {
    console.log("Before Step: " + pickleStep.text);
});

AfterStep({ tags: "not @api" }, async function ({ pickle, pickleStep }) {
    console.log("After Step: " + pickleStep.text);
    // let img: Buffer;
    // img = await fixture.page.screenshot(
    //     { path: `./test-results/screenshots/${pickle.name.replace(/[^a-zA-Z0-9-_]/g, "_")}/${pickleStep.text}.png`, type: "png" });
    // await this.attach(img, "image/png");
    // console.log("Screenshot taken after this step");
});