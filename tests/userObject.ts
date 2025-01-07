import type { Page, Locator, BrowserContext, Browser } from "@playwright/test";

export type Credential = {
  email: string;
  password: string;
};

// test the program logic using the same account for all 3 users.
export class SameAccount {
  private readonly brower: Browser;
  private context: BrowserContext;
  private user1: Page;
  private user2: Page;
  private user3: Page;
  private userCreated: boolean;

  constructor(browser: Browser) {
    this.brower = browser;
    this.userCreated = false;
  }

  async createUsers() {
    this.context = await this.brower.newContext();
    this.user1 = await this.context.newPage();
    this.user2 = await this.context.newPage();
    this.user3 = await this.context.newPage();
    this.userCreated = true;
  }
  async getUsers() {
    if (!this.userCreated) {
      throw Error("user not being created, call createUsers() first");
    }
    return { user1: this.user1, user2: this.user2, user3: this.user3 };
  }

  async gotoChessWebsite() {
    this.user1.goto("http://localhost:5173/");
    this.user2.goto("http://localhost:5173/");
    this.user3.goto("http://localhost:5173/");
  }

  async login(credential: Credential) {
    await this.user1.getByPlaceholder("Enter email").fill(credential.email);
    await this.user1
      .getByPlaceholder("Enter password")
      .fill(credential.password);
    this.user1.getByRole("button", { name: "Connect" }).click();
    await this.user1.locator("text=Welcome ").waitFor();
    await this.user2.locator("text=Welcome ").waitFor();
    await this.user3.locator("text=Welcome ").waitFor();
  }

  async signout() {
    await this.user1.getByRole("button", { name: "Sign out" }).click();
  }

  async executeMethod(
    method: (user1: Page, user2: Page, user3: Page) => Promise<void>
  ) {
    await method(this.user1, this.user2, this.user3);
  }
}

// test the program logic using the different account for each user.
export class DifferentAccount {
  private readonly brower: Browser;
  private context: BrowserContext;
  private context2: BrowserContext;
  private context3: BrowserContext;
  private user1: Page;
  private user2: Page;
  private user3: Page;
  private userCreated: boolean;

  constructor(browser: Browser) {
    this.brower = browser;
    this.userCreated = false;
  }

  async createUsers() {
    this.context = await this.brower.newContext();
    this.context2 = await this.brower.newContext();
    this.context3 = await this.brower.newContext();
    this.user1 = await this.context.newPage();
    this.user2 = await this.context2.newPage();
    this.user3 = await this.context3.newPage();
    this.userCreated = true;
  }
  async getUsers() {
    if (!this.userCreated) {
      throw Error("user not being created, call createUsers() first");
    }
    return { user1: this.user1, user2: this.user2, user3: this.user3 };
  }

  async gotoChessWebsite() {
    this.user1.goto("http://localhost:5173/");
    this.user2.goto("http://localhost:5173/");
    this.user3.goto("http://localhost:5173/");
  }

  async login(credential: Credential[]) {
    await this.user1.getByPlaceholder("Enter email").fill(credential[0].email);
    await this.user1
      .getByPlaceholder("Enter password")
      .fill(credential[0].password);
    await this.user2.getByPlaceholder("Enter email").fill(credential[1].email);
    await this.user2
      .getByPlaceholder("Enter password")
      .fill(credential[1].password);
    await this.user3.getByPlaceholder("Enter email").fill(credential[2].email);
    await this.user3
      .getByPlaceholder("Enter password")
      .fill(credential[2].password);
    this.user1.getByRole("button", { name: "Connect" }).click();
    this.user2.getByRole("button", { name: "Connect" }).click();
    this.user3.getByRole("button", { name: "Connect" }).click();
    await this.user1.locator("text=Welcome ").waitFor();
    await this.user2.locator("text=Welcome ").waitFor();
    await this.user3.locator("text=Welcome ").waitFor();
  }
  async executeMethod(
    method: (user1: Page, user2: Page, user3: Page) => Promise<void>
  ) {
    await method(this.user1, this.user2, this.user3);
  }

  async signout() {
    if (await !this.user1.getByRole("heading", { name: "Login" }).isVisible) {
      await this.user1.getByRole("button", { name: "Sign out" }).click();
    }
    if (await !this.user2.getByRole("heading", { name: "Login" }).isVisible) {
      await this.user2.getByRole("button", { name: "Sign out" }).click();
    }
    if (await !this.user3.getByRole("heading", { name: "Login" }).isVisible) {
      await this.user3.getByRole("button", { name: "Sign out" }).click();
    }
  }
}
