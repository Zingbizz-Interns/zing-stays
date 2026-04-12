import type { Request, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';

/**
 * Custom error for listing input validation failures (city/locality resolution).
 * Use `instanceof` instead of fragile string matching.
 */
export class ListingInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ListingInputError';
  }
}

/**
 * Parse an integer route parameter. Returns the parsed number or sends
 * a 400 response and returns `null`.
 */
export function parseIntParam(req: Request, res: Response, param: string): number | null {
  const raw = req.params[param];
  const value = parseInt(raw as string, 10);
  if (isNaN(value)) {
    res.status(400).json({ error: `Invalid ${param}` });
    return null;
  }
  return value;
}

/** Normalize a query param that may be single or repeated to an array of positive integers. */
export function toIntArray(val: unknown): number[] | undefined {
  if (val === undefined || val === null) return undefined;
  const arr = Array.isArray(val) ? val : [val];
  const nums = arr
    .map(v => Number(v))
    .filter(n => !isNaN(n) && n > 0 && Number.isInteger(n));
  return nums.length > 0 ? nums : undefined;
}

/** Normalize a query param that may be single or repeated to a string array. */
export function toStringArray(val: unknown): string[] | undefined {
  if (val === undefined || val === null) return undefined;
  const arr = Array.isArray(val) ? val : [val];
  const strs = arr.filter((s): s is string => typeof s === 'string' && s.length > 0);
  return strs.length > 0 ? strs : undefined;
}

/** Normalize nullable city/locality names to empty strings for display. */
export function withDisplayLocation<T extends { city: string | null; locality: string | null }>(listing: T) {
  return {
    ...listing,
    city: listing.city ?? '',
    locality: listing.locality ?? '',
  };
}

/** Check if the authenticated user can modify a listing (owner or admin). */
export function canModifyListing(req: AuthRequest, listing: { ownerId: number }): boolean {
  return req.user!.userId === listing.ownerId || req.user!.isAdmin;
}
