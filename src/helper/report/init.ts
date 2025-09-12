const fs = require("fs-extra");
try {
    fs.ensureDir("test-results");
    fs.emptyDir("test-results");
    fs.emptyDir("allure-results");
    console.log("Folders created!");
} catch (error) {
    console.log("Folder not created! " + error);
}
