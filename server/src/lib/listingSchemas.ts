import { z } from 'zod';
import {
  furnishingValues,
  genderValues,
  intentValues,
  isRoomTypeAllowedForPropertyType,
  preferredTenantValues,
  propertyTypeValues,
  roomTypeValues,
} from './listingFields';

const optionalNumberField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  return value;
}, z.coerce.number().int().min(0).optional());

const optionalDateField = z.preprocess((value) => {
  if (value === '' || value === null || value === undefined) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return value;
}, z.date().optional());

export const listingBaseSchema = z.object({
  title: z.string().min(5).max(200),
  cityId: z.number().int().positive().optional(),
  localityId: z.number().int().positive().optional(),
  intent: z.enum(intentValues).optional().default('rent'),
  price: z.number().int().min(500).max(500000),
  roomType: z.enum(roomTypeValues),
  propertyType: z.enum(propertyTypeValues),
  deposit: optionalNumberField,
  areaSqft: optionalNumberField,
  availableFrom: optionalDateField,
  furnishing: z.enum(furnishingValues).optional(),
  preferredTenants: z.enum(preferredTenantValues).optional().default('any'),
  description: z.string().max(2000).optional(),
  landmark: z.string().max(200).optional(),
  address: z.string().optional(),
  foodIncluded: z.boolean().optional().default(false),
  genderPref: z.enum(genderValues).optional().default('any'),
  amenities: z.array(z.string()).optional().default([]),
  rules: z.string().optional(),
  images: z.array(z.string().url()).optional().default([]),
});

const roomTypeRefinement = (
  value: {
    roomType: (typeof roomTypeValues)[number];
    propertyType: (typeof propertyTypeValues)[number];
  },
  ctx: z.RefinementCtx,
) => {
  if (!isRoomTypeAllowedForPropertyType(value.roomType, value.propertyType)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['roomType'],
      message:
        value.propertyType === 'pg' || value.propertyType === 'hostel'
          ? 'PG/Hostel listings must use Single, Double, or Multiple room types.'
          : 'Apartment/Flat listings must use BHK room types.',
    });
  }
};

export const listingInputSchema = listingBaseSchema.superRefine(roomTypeRefinement);

export const createListingSchema = listingBaseSchema.superRefine(roomTypeRefinement).superRefine((value, ctx) => {
  if (!value.cityId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['cityId'],
      message: 'cityId is required',
    });
  }
  if (!value.localityId) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['localityId'],
      message: 'localityId is required',
    });
  }
});

export const updateListingSchema = listingBaseSchema.partial();

export const listingsQuerySchema = z.object({
  cityId: z.coerce.number().int().positive().optional(),
  localityId: z.coerce.number().int().positive().optional(),
  intent: z.enum(intentValues).optional(),
  room_type: z.enum(roomTypeValues).optional(),
  property_type: z.enum(propertyTypeValues).optional(),
  food_included: z.enum(['true', 'false']).optional(),
  gender: z.enum(genderValues).optional(),
  price_min: z.coerce.number().int().positive().optional(),
  price_max: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
