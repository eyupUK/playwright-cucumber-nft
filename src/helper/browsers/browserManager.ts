import { LaunchOptions, chromium, firefox, webkit } from "@playwright/test";


export let browserType: string;
export const invokeBrowser = () => {
    const head = process.env.HEAD || "false";
    const isHeadless = !(head.toLowerCase() === "true") ? true : false;
    const options: LaunchOptions = {
        headless: isHeadless,
        // args: ['--start-fullscreen', '--start-maximized']
    }
    console.log("Running tests in headless mode: " + isHeadless);

    browserType =  process.env.BROWSER || "chrome";
    console.log("Launching " + browserType + " browser");
    switch (browserType) {
        case "chrome":
            return chromium.launch(options);
        case "firefox":
            return firefox.launch(options);
        case "webkit":
            return webkit.launch(options);
        default:
            throw new Error("Please set the proper browser!")
    }
}