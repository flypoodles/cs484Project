import { test, expect } from "@playwright/test";

test("log in should redirect to lobby", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByPlaceholder("Enter email").fill("annie@uic.edu");
  await page.getByPlaceholder("Enter password").fill("1gerende");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome annie!" })
  ).toBeVisible();
});

test("user should still be connected with a new tab", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const page2 = await context.newPage();
  await page.goto("http://localhost:5173/");
  await page2.goto("http://localhost:5173/");
  await page.getByPlaceholder("Enter email").fill("annie@uic.edu");
  await page.getByPlaceholder("Enter password").fill("1gerende");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome annie!" })
  ).toBeVisible();
  await expect(
    page2.getByRole("heading", { name: "Welcome annie!" })
  ).toBeVisible();
});
