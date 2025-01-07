import { test as base } from "@playwright/test";
import { SameAccount, DifferentAccount, Credential } from "./userObject";
// Declare the types of your fixtures.
type MyFixtures = {
  sameAccount: SameAccount;
  differentAccount: DifferentAccount;
};

export const test = base.extend<MyFixtures>({
  sameAccount: async ({ browser }, use) => {
    // Set up the fixture.
    const sameAccount = new SameAccount(browser);
    await sameAccount.createUsers();
    await sameAccount.gotoChessWebsite();

    const credential: Credential = {
      email: "test@uic.edu",
      password: "testing",
    };
    // Use the fixture value in the test.
    await sameAccount.login(credential);
    await use(sameAccount);
    await sameAccount.signout();
  },

  differentAccount: async ({ browser }, use) => {
    // Set up the fixture.
    const differentAccount = new DifferentAccount(browser);
    await differentAccount.createUsers();
    await differentAccount.gotoChessWebsite();

    const credentials: Credential[] = [
      { email: "test1@uic.edu", password: "testing" },
      { email: "test2@uic.edu", password: "testing" },
      { email: "test3@uic.edu", password: "testing" },
    ];
    // Use the fixture value in the test.
    await differentAccount.login(credentials);
    await use(differentAccount);
    await differentAccount.signout();
  },
});
export { expect } from "@playwright/test";
