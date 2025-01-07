import { test, expect } from "@playwright/test";

test("log in should redirect to lobby", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await page.getByPlaceholder("Enter email").fill("test@uic.edu");
  await page.getByPlaceholder("Enter password").fill("testing");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();
});

test("user should still be connected with a new tab", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const page2 = await context.newPage();
  await page.goto("http://localhost:5173/");
  await page2.goto("http://localhost:5173/");
  await page.getByPlaceholder("Enter email").fill("test@uic.edu");
  await page.getByPlaceholder("Enter password").fill("testing");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();
  await expect(
    page2.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();
});

test("testing", async ({ browser }) => {
  const context = await browser.newContext();
  const context2 = await browser.newContext();
  const page = await context.newPage();
  const otherPage = await context2.newPage();
  await otherPage.goto("http://localhost:5173/");
  await page.goto("http://localhost:5173/");

  await page.getByPlaceholder("Enter email").fill("test@uic.edu");
  await page.getByPlaceholder("Enter password").fill("testing");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();
  await expect(otherPage.getByRole("heading", { name: "Login" })).toBeVisible();
});

test("sign out", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const page2 = await context.newPage();
  await page.goto("http://localhost:5173/");
  await page2.goto("http://localhost:5173");

  await page.getByPlaceholder("Enter email").fill("test@uic.edu");
  await page.getByPlaceholder("Enter password").fill("testing");
  await page.getByRole("button", { name: "Connect" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();
  await expect(
    page2.getByRole("heading", { name: "Welcome test!" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page.getByRole("heading", { name: "Login" })).toBeVisible();
  await expect(page2.getByRole("heading", { name: "Login" })).toBeVisible();
});
