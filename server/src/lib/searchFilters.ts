import {
  type GenderPref,
  type ListingIntent,
  type PropertyType,
  type RoomType,
} from './listingFields';

export const VALID_SORT_FIELDS = [
  'completeness_score:desc',
  'completeness_score:asc',
  'price:asc',
  'price:desc',
  'created_at:desc',
  'created_at:asc',
] as const;

export interface SearchFilterInput {
  city?: string;
  locality?: string;
  cityId?: number;
  localityId?: number;
  localityIds?: number[];
  intent?: ListingIntent;
  roomType?: RoomType | RoomType[];
  propertyType?: PropertyType | PropertyType[];
  foodIncluded?: 'true' | 'false';
  gender?: GenderPref;
  priceMin?: number;
  priceMax?: number;
  /** 'now' = available today, 'soon' = within 30 days, 'any' = no filter */
  availability?: 'now' | 'soon' | 'any';
  preferredTenants?: string[];
  furnishing?: string[];
}

export function escapeFilterValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

export function normalizeSortField(value?: string): string {
  return VALID_SORT_FIELDS.includes(value as (typeof VALID_SORT_FIELDS)[number])
    ? value!
    : 'completeness_score:desc';
}

/** Build a Meilisearch OR-filter from an array of values for a single field. */
function buildOrFilter(field: string, values: string[]): string | null {
  if (values.length === 0) return null;
  if (values.length === 1) return `${field} = "${values[0]}"`;
  return `(${values.map(v => `${field} = "${v}"`).join(' OR ')})`;
}

/** Same as buildOrFilter but for numeric field values. */
function buildOrFilterNumeric(field: string, values: number[]): string | null {
  if (values.length === 0) return null;
  if (values.length === 1) return `${field} = ${values[0]}`;
  return `(${values.map(v => `${field} = ${v}`).join(' OR ')})`;
}

const BUY_ALLOWED_PROPERTY_TYPES: PropertyType[] = ['apartment', 'flat'];

export function buildSearchFilters(input: SearchFilterInput): string[] {
  const filters: string[] = ['status = "active"'];

  if (input.city) filters.push(`city = "${escapeFilterValue(input.city)}"`);
  if (input.locality) filters.push(`locality = "${escapeFilterValue(input.locality)}"`);
  if (input.cityId !== undefined) filters.push(`city_id = ${input.cityId}`);

  // Multi-locality: localityIds[] takes precedence over single localityId
  if (input.localityIds && input.localityIds.length > 0) {
    const f = buildOrFilterNumeric('locality_id', input.localityIds);
    if (f) filters.push(f);
  } else if (input.localityId !== undefined) {
    filters.push(`locality_id = ${input.localityId}`);
  }

  if (input.intent) filters.push(`intent = "${input.intent}"`);

  // Product rule: buy intent restricts property types to apartment/flat
  const propTypes = input.propertyType
    ? (Array.isArray(input.propertyType) ? input.propertyType : [input.propertyType])
    : [];

  if (input.intent === 'buy') {
    const allowed = propTypes.filter(pt => BUY_ALLOWED_PROPERTY_TYPES.includes(pt));
    const f = buildOrFilter('property_type', allowed.length > 0 ? allowed : BUY_ALLOWED_PROPERTY_TYPES);
    if (f) filters.push(f);
  } else {
    const f = buildOrFilter('property_type', propTypes);
    if (f) filters.push(f);
  }

  // Room type
  const roomTypes = input.roomType
    ? (Array.isArray(input.roomType) ? input.roomType : [input.roomType])
    : [];
  const rtFilter = buildOrFilter('room_type', roomTypes);
  if (rtFilter) filters.push(rtFilter);

  if (input.foodIncluded === 'true') filters.push('food_included = true');
  if (input.gender && input.gender !== 'any') filters.push(`(gender_pref = "${input.gender}" OR gender_pref = "any")`);
  if (input.priceMin !== undefined) filters.push(`price >= ${input.priceMin}`);
  if (input.priceMax !== undefined) filters.push(`price <= ${input.priceMax}`);

  // Availability filter
  if (input.availability === 'now') {
    filters.push(`available_from_ts <= ${Math.floor(Date.now() / 1000)}`);
  } else if (input.availability === 'soon') {
    filters.push(`available_from_ts <= ${Math.floor((Date.now() + 30 * 24 * 3600 * 1000) / 1000)}`);
  }

  // Preferred tenants: include listings matching ANY selected type, plus "any"
  if (input.preferredTenants && input.preferredTenants.length > 0) {
    const nonAny = input.preferredTenants.filter(t => t !== 'any');
    if (nonAny.length > 0) {
      const f = buildOrFilter('preferred_tenants', [...nonAny, 'any']);
      if (f) filters.push(f);
    }
  }

  // Furnishing
  const furnishingFilter = buildOrFilter('furnishing', input.furnishing ?? []);
  if (furnishingFilter) filters.push(furnishingFilter);

  return filters;
}
