const {test, expect} = require("../fixtures");

let pageErrors = [];

test.describe("File selection", {tag: "@isolated"}, () => {
    test.beforeEach(async ({ui, page, connectionApi, loginApi}) => {
        await loginApi.loginDefault();
        await connectionApi.ensureConnected("VIRTUAL");

        await ui.gotoLoggedInCore();
        await expect(page.getByTestId("state-string")).toHaveText("Operational", {
            timeout: 15_000
        });

        pageErrors = [];
        page.on("pageerror", (error) => {
            pageErrors.push(`[${error.name}] ${error.message}`);
        });
        page.on("console", (msg) => {
            if (msg.type() === "error") {
                pageErrors.push(`[${msg.type()}] ${msg.text()}`);
            }
        });
    });

    test.afterEach(async () => {
        await expect(pageErrors).toStrictEqual([]);
    });

    test("select local file", async ({page, filesApi}) => {
        const fileId = filesApi.getEntryId("local", "selection-test.gcode");
        const fileEntry = await page.locator(`#gcode_file_${fileId}`);

        await fileEntry.locator(".btn-files-select").click();

        await expect(fileEntry.locator(".title")).toHaveCSS("font-weight", "700");
        await expect(page.getByTestId("selected-file-string")).toHaveText(
            "selection-test.gcode"
        );
        await expect(page.getByTestId("selected-file-sd")).toBeHidden();
    });

    test("select printer file", async ({page, filesApi}) => {
        const fileId = filesApi.getEntryId("sdcard", "select~1.gco");
        const fileEntry = await page.locator(`#gcode_file_${fileId}`);

        await fileEntry.locator(".btn-files-select").click();

        await expect(fileEntry.locator(".title")).toHaveCSS("font-weight", "700");
        await expect(page.getByTestId("selected-file-string")).toHaveText(
            "/select~1.gco"
        );
        await expect(page.getByTestId("selected-file-sd")).toBeVisible();
    });
});
