import { test, expect } from '@playwright/test';
import { z } from 'zod';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}

const emailSchema = z.string().email();
const websiteSchema = z.string().url();
const geoCoordinateSchema = z.object({
  lat: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90,
      { message: 'Invalid latitude. Must be a number between -90 and 90.' }
    ),
  lng: z
    .string()
    .refine(
      (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180,
      { message: 'Invalid longitude. Must be a number between -180 and 180.' }
    ),
});

function isValid(value: string, schema: 'website' | 'email'): boolean {
  let result: z.SafeParseReturnType<string, string>;

  switch (schema) {
    case 'website':
      result = websiteSchema.safeParse(value);
      break;
    case 'email':
      result = emailSchema.safeParse(value);
      break;
    default:
      return false;
  }

  return result.success;
}

function isValidGeoCoordinate(geo: { lat: string; lng: string }): boolean {
  return geoCoordinateSchema.safeParse(geo).success;
}

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
    expect(isValidGeoCoordinate(geoLocation)).toBeTruthy();

    expect(user.company).toBeDefined();
  }
});
