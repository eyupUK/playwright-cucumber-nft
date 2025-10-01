import { LaunchOptions, chromium, firefox, webkit } from "@playwright/test";

type BrowserType = 'chromium' | 'firefox' | 'webkit';

export const invokeBrowser = () => {
    const head = process.env.HEAD || "false";
    const isHeadless = head.toLowerCase() !== "true";
    const options: LaunchOptions = {
        headless: isHeadless,
        // args: ['--start-fullscreen', '--start-maximized']
    }
    console.log("Running tests in headless mode: " + isHeadless);

    const browserType: BrowserType = (process.env.BROWSER as BrowserType) || "chromium";
    console.log("Launching " + browserType + " browser");
    switch (browserType) {
        case "chromium":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!")
    }
}