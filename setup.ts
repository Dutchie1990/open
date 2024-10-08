import { chromium, FullConfig } from "@playwright/test";
import fs from "fs";

export default async function setup(config: FullConfig): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext();

  const usersResponse = await context.request.get(
    "https://jsonplaceholder.typicode.com/users"
  );
  const users = await usersResponse.json();

  fs.writeFileSync("usersData.json", JSON.stringify(users));
}
