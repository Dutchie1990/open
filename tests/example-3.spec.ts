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
    const userResponse =  await request.get(`https://jsonplaceholder.typicode.com/users/${user.id}`);
    const userData: User = await userResponse.json();

    expect(userData.name).toBeDefined();
    expect(isValid(userData.email, 'email')).toBeTruthy();

    // Manually add "http://" to the website if missing, as zod doesn't allow URLs without schemes
    let url: string = userData.website;
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + userData.website;
    }
    expect(isValid(url, 'website')).toBeTruthy();

    const geoLocation = { lat: userData.address.geo.lat, lng: userData.address.geo.lng };
    expect(isValid(geoLocation, "geolocation")).toBeTruthy();

    expect(userData.company).toBeDefined();
  }
});
