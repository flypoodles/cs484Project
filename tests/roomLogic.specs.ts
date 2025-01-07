import { test, expect } from "./MyFixture";
import type { Page } from "@playwright/test";
test.describe("room logic", () => {
  test("join a room using room number", async ({
    differentAccount,
    sameAccount,
  }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      await user1.getByRole("button", { name: "Create" }).click();
      await user1.waitForURL("**/GameRoom");
      const code = await user1.getByTitle("roomNumber").innerText();

      await user2.getByRole("button", { name: "Join a room" }).click();
      await user3.getByRole("button", { name: "Join a room" }).click();
      await user2.getByPlaceholder("Enter room number").fill(code);
      await user3.getByPlaceholder("Enter room number").fill(code);
      await user2.getByRole("button", { name: "Join" }).click();
      await user2.waitForURL("**/GameRoom");
      await user3.getByRole("button", { name: "Join" }).click();
      await expect(user3.getByText("room is full")).toBeVisible();
      await expect(user1.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#GameRoom")).toBeVisible();
    };

    await sameAccount.executeMethod(method);
    await differentAccount.executeMethod(method);
  });

  test("join any room and make sure another user cannot join the room when room is full", async ({
    differentAccount,
    sameAccount,
  }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      await user1.getByRole("button", { name: "Create" }).click();

      await user1.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Join random" }).click();
      await user2.waitForURL("**/GameRoom");
      await user3.getByRole("button", { name: "Join random" }).click();
      await expect(user3.getByText("There is no room to join")).toBeVisible();
      await expect(user1.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#GameRoom")).toBeVisible();
    };
    await sameAccount.executeMethod(method);
    await differentAccount.executeMethod(method);
  });

  test("ready feature", async ({ sameAccount, differentAccount }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      await user1.getByRole("button", { name: "Create" }).click();
      await user1.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Join random" }).click();
      await user2.waitForURL("**/GameRoom");
      await expect(user1.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#GameRoom")).toBeVisible();

      const board = await user1.locator("#board");
      const board2 = await user2.locator("#board");
      await expect(board.locator("div")).toHaveCount(0);
      await expect(board2.locator("div")).toHaveCount(0);

      await user1.getByRole("button", { name: "Ready" }).click();
      await user2.getByRole("button", { name: "Ready" }).click();
      await expect(board.locator("div")).toHaveCount(90);
      await expect(board2.locator("div")).toHaveCount(90);
    };
    await sameAccount.executeMethod(method);
    await differentAccount.executeMethod(method);
  });

  test("leave room feature", async ({ sameAccount, differentAccount }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      await user1.getByRole("button", { name: "Create" }).click();
      await user1.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Join random" }).click();
      await user2.waitForURL("**/GameRoom");
      await user3.getByRole("button", { name: "Join random" }).click();
      await expect(user1.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#GameRoom")).toBeVisible();
      await expect(user3.getByText("There is no room to join")).toBeVisible();

      await user2.getByRole("button", { name: "Leave Room" }).click();
      await user2.waitForURL("**/Lobby");
      await user3.getByRole("button", { name: "Join random" }).click();
      await user3.waitForURL("**/GameRoom");
      await expect(user3.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#lobby")).toBeVisible();
    };
    await sameAccount.executeMethod(method);
    await differentAccount.executeMethod(method);
  });

  test("Make sure user will not receive old room's data after leaving the room.", async ({
    sameAccount,
    differentAccount,
  }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      await user1.getByRole("button", { name: "Create" }).click();
      await user1.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Create" }).click();
      await user2.waitForURL("**/GameRoom");
      await user3.getByRole("button", { name: "Join random" }).click();
      await user3.waitForURL("**/GameRoom");
      //await expect(user3.getByTestId("OpponentUserName")).toHaveText("");
      await user3.getByRole("button", { name: "Leave Room" }).click();
      await user3.waitForURL("**/Lobby");
      await user3.getByRole("button", { name: "Create" }).click();
      await user3.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Leave Room" }).click();
      await user2.waitForURL("**/Lobby");
      await user2.getByRole("button", { name: "Join random" }).click();
      await user2.waitForURL("**/GameRoom");

      const board = await user1.locator("#board");
      const board2 = await user2.locator("#board");
      const board3 = await user3.locator("#board");

      await expect(board.locator("div")).toHaveCount(0);
      await expect(board2.locator("div")).toHaveCount(0);
      await expect(board3.locator("div")).toHaveCount(0);

      await user1.getByRole("button", { name: "Ready" }).click();
      await user2.getByRole("button", { name: "Ready" }).click();
      await expect(board.locator("div")).toHaveCount(90);
      await expect(board2.locator("div")).toHaveCount(90);
      await expect(board3.locator("div")).toHaveCount(0);
      await user2.getByRole("button", { name: "Leave Room" }).click();
      await user1.getByRole("button", { name: "Leave Room" }).click();
      await user3.getByRole("button", { name: "Leave Room" }).click();
    };
    await sameAccount.executeMethod(method);
    await differentAccount.executeMethod(method);
  });

  test("Make sure all users are not deleted", async ({ differentAccount }) => {
    const method = async (
      user1: Page,
      user2: Page,
      user3: Page
    ): Promise<void> => {
      const username = await user1.getByTestId("username").innerText();
      const username2 = await user2.getByTestId("username").innerText();
      await user1.getByRole("button", { name: "Create" }).click();
      await user1.waitForURL("**/GameRoom");
      await user2.getByRole("button", { name: "Create" }).click();
      await user2.waitForURL("**/GameRoom");
      await user3.getByRole("button", { name: "Join random" }).click();
      await expect(user1.locator("#GameRoom")).toBeVisible();
      await expect(user2.locator("#GameRoom")).toBeVisible();
      await expect(user3.locator("#GameRoom")).toBeVisible();

      await user3.getByRole("button", { name: "Sign out" }).click();
      await user1.getByRole("button", { name: "Leave Room" }).click();
      await user2.getByRole("button", { name: "Leave Room" }).click();
      await expect(user1.getByTestId("username")).toHaveText(username);
      await expect(user2.getByTestId("username")).toHaveText(username2);
    };
    await differentAccount.executeMethod(method);
  });
});
