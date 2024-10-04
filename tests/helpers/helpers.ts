import { Geolocation } from "../types/types";
import {z} from "zod"

const emailSchema = z.string().email();
const websiteSchema = z.string().url();
const geoCoordinateSchema = z.object({
  lat: z.string().refine(
    (val: string) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -90 && parseFloat(val) <= 90,
    { message: "Invalid latitude. Must be a number between -90 and 90." }
  ),
  lng: z.string().refine(
    (val: string) => !isNaN(parseFloat(val)) && isFinite(parseFloat(val)) && parseFloat(val) >= -180 && parseFloat(val) <= 180,
    { message: "Invalid longitude. Must be a number between -180 and 180." }
  )
});


export function isValid(value: string | Geolocation, schema: "website" | "email" | "geolocation"): boolean {
  let result: z.SafeParseReturnType<any, any>; 

  switch (schema) {
    case "website":
      result = websiteSchema.safeParse(value);
      break;
    case "email":
      result = emailSchema.safeParse(value);
      break;
    case "geolocation":
      // Check if value is a valid geo-coordinate object
      if (typeof value === 'object' && 'lat' in value && 'lng' in value) {
        result = geoCoordinateSchema.safeParse(value);
      } else {
        return false; // Invalid geolocation object
      }
      break;
    default:
      return false;
  }

  return result.success;
}