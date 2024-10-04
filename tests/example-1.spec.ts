import { test, expect } from '@playwright/test';
import { User } from './types/types';
import { isValid } from  "./helpers/helpers"

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
    let geoLocation = {"lat": user.address?.geo?.lat, "lng": user.address?.geo?.lng }
    expect(isValid( geoLocation, "geolocation")).toBeTruthy()
  });
});

test('User company should be defined', async ({ request }) => {
  const response = await request.get('https://jsonplaceholder.typicode.com/users')
  const users: User[] = await response.json()
  users.forEach( user => {
    expect(user.company).toBeDefined()
  });
});


