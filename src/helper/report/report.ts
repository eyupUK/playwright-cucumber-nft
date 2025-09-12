import * as report from "multiple-cucumber-html-reporter";
import os = require("node:os");

const browserInfo = require("../../../browser-info.json");

report.generate({
    jsonDir: "test-results",
    reportPath: "test-results/reports/",
    reportName: "My App Test Report",
    pageTitle: "My App Test Report",
    displayDuration: true,
    durationInMS: true,
    openReportInBrowser: true,
    removeExistingJsonReportFile: true,
    displayReportTime: true,
    displayReportTimeInSeconds: true,
    useCDN: true,
    metadata: {
        browser: {
            name: browserInfo.name,
            version: browserInfo.version,
        },
        device: "Macbook Pro",
        platform: {
            name: os.platform(),
            version: os.version(),
        },
    },
    customData: {
        title: "Test Info",
        data: [
            { label: "Project", value: "My App" },
            { label: "Release", value: "1.1.1" },
            { label: "Cycle", value: "Smoke-1" }
        ],
    },
});
