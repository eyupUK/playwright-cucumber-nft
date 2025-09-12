const os = require("node:os");
const process = require("node:process");

module.exports = {
    default: {
        // Note: TAGS and tags are two different argument. TAGS is not working in linux env.
        format: [
            "./config/allure-reporter.cjs",
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        formatOptions: {
            snippetInterface: "async-await",
            resultsDir: "allure-results",
        },
        tags: process.env.npm_config_tags || "",
        paths: ["src/test/features/**/*.feature"],
        require: ["src/test/stepDefs/**/*.ts", "src/hooks/hooks.ts"],
        requireModule: ["ts-node/register"],
        parallel: parseInt(process.env.PARALLEL, 10) || 0, // Convert PARALLEL to a number
        timeout: 120000,
        dryRun: false,
    },
    rerun: {
        format: [
            "./config/allure-reporter.cjs",
            "progress-bar",
            "html:test-results/cucumber-report.html",
            "json:test-results/cucumber-report.json",
            "rerun:@rerun.txt",
        ],
        formatOptions: {
            snippetInterface: "async-await",
            resultsDir: "allure-results",
        },
        require: ["src/test/stepDefs/**/*.ts", "src/hooks/hooks.ts"],
        requireModule: ["ts-node/register"],
        parallel: parseInt(process.env.PARALLEL, 10) || 0, // Convert PARALLEL to a number
        retry: 2,
        timeout: 120000
    }
};
