import { test, expect } from "@playwright/test";
import { User } from "./types/types";
import { isValid } from "./helpers/helpers";
import testData from "../usersData.json";

testData?.forEach((user: User) => {
  test(`Validate user data for: ${user?.username}`, async ({ request }) => {
    expect(user?.name).toBeDefined();
    expect(isValid(user.email, "email")).toBeTruthy();

    // Manually add "http://" to the website if missing, as zod doesn't allow URLs without schemes
    let url: string = user.website;
    if (!/^https?:\/\//i.test(url)) {
      url = "http://" + user.website;
    }
    expect(isValid(url, "website")).toBeTruthy();

    const geoLocation = {
      lat: user.address.geo.lat,
      lng: user.address.geo.lng,
    };
    expect(isValid(geoLocation, "geolocation")).toBeTruthy();

    expect(user.company).toBeDefined();

    const body = {
      title: user.name,
      body: user.company,
    };

    const response = await request.post(
      "https://jsonplaceholder.typicode.com/posts",
      { data: body }
    );

    const postData = await response.json();
    expect(postData.id).toBeDefined();
    expect(postData.title).toStrictEqual(user.name);
    expect(postData.body).toStrictEqual(user.company);
  });
});

async function fetchUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users"); // Example API
  if (!response.ok) {
    throw new Error(`Error fetching users: ${response.statusText}`);
  }
  return await response.json(); // Parse and return the JSON data
}

test.describe("Parameterized tests for each user", () => {
  test(`Validate user data for all users`, async ({ request }) => {
    const users = await fetchUsers();
    for (const user of users) {
      await test.step(`Validate user data for: ${user.username}`, async () => {
        expect.soft(user.name).toBeDefined();
        expect.soft(isValid(user.email, "email")).toBeTruthy();

        // Manually add "http://" to the website if missing, as zod doesn't allow URLs without schemes
        let url: string = user.website;
        if (!/^https?:\/\//i.test(url)) {
          url = "http://" + user.website;
        }
        expect.soft(isValid(url, "website")).toBeTruthy();

        const geoLocation = {
          lat: user.address.geo.lat,
          lng: user.address.geo.lng,
        };
        expect.soft(isValid(geoLocation, "geolocation")).toBeTruthy();

        expect.soft(user.company).toBeDefined();

        const body = {
          title: user.name,
          body: user.company,
        };

        const response = await request.post(
          "https://jsonplaceholder.typicode.com/posts",
          { data: body }
        );

        const postData = await response.json();
        expect.soft(postData.id).toBeDefined();
        expect.soft(postData.title).toStrictEqual(user.name);
        expect.soft(postData.body).toStrictEqual(user.company);
      });
    }
  });
});
