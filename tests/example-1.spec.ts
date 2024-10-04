import { test, expect } from '@playwright/test';
import {z} from "zod"

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
  lat: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90,
    { message: "Invalid latitude. Must be a number between -90 and 90." }
  ),
  lng: z.string().refine(
    (val) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180,
    { message: "Invalid longitude. Must be a number between -180 and 180." }
  )
});


function isValid(value: string, schema: "website" | "email"): boolean {
  let result: z.SafeParseReturnType<string, string>;
  
  switch (schema) {
    case "website":
      result = websiteSchema.safeParse(value);
      break;
    case "email":
      result = emailSchema.safeParse(value);
      break;
    default:
      return false;
  }
  
  return result.success;
}

function isValidGeoCoordinate(geo: { lat: string, lng: string }): boolean {
  return geoCoordinateSchema.safeParse(geo).success;
}

test('Name has to be defined', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    expect(user.name).toBeDefined()
  });
});

test('Email must be valid', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    expect(isValid(user.email, "email")).toBeTruthy()
  });
});

test('Website must be valid', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    // manually adding http as zod does not consider "conrad.org" a valid url.  Depending on the requimenents this test will fail or pass
    let url: string = ''
    if (!/^https?:\/\//i.test(user.website)) {
      url = 'http://' + user.website;
    }
    expect(isValid(url, "website")).toBeTruthy()
  });
});

test('Lat and lng must be valid numbers', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    let geoLocation = {"lat": user.address.geo.lat, "lng": user.address.geo.lng }
    expect(isValidGeoCoordinate( geoLocation)).toBeTruthy()
  });
});

test('User company should be defined', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    expect(user.company).toBeDefined()
  });
});


