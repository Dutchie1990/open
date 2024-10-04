import { test, expect } from '@playwright/test';
import { User } from './types/types';
import { isValid } from  "./helpers/helpers"

let users: User[] = [];

test.beforeAll(async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users');
  users = await response.json();
});

test('Validate user data', async ({ request }) => {
  // Ensure users are fetched before running the tests
  expect(users.length).toBeGreaterThan(0);

  // Run validation for each user
  for (const user of users) {
    expect(user.name).toBeDefined();
    expect(isValid(user.email, 'email')).toBeTruthy();

    // Manually add "http://" to the website if missing, as zod doesn't allow URLs without schemes
    let url: string = user.website;
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + user.website;
    }
    expect(isValid(url, 'website')).toBeTruthy();

    const geoLocation = { lat: user.address.geo.lat, lng: user.address.geo.lng };
    expect(isValid(geoLocation, "geolocation")).toBeTruthy();

    expect(user.company).toBeDefined();
  }
});
