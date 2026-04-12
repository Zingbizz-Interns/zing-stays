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

const BUY_ALLOWED_PROPERTY_TYPES: PropertyType[] = ['apartment', 'flat'];

export function buildSearchFilters(input: SearchFilterInput): string[] {
  const filters: string[] = ['status = "active"'];

  if (input.city) filters.push(`city = "${escapeFilterValue(input.city)}"`);
  if (input.locality) filters.push(`locality = "${escapeFilterValue(input.locality)}"`);
  if (input.cityId !== undefined) filters.push(`city_id = ${input.cityId}`);

  // Multi-locality support: localityIds[] takes precedence over single localityId
  if (input.localityIds && input.localityIds.length > 0) {
    if (input.localityIds.length === 1) {
      filters.push(`locality_id = ${input.localityIds[0]}`);
    } else {
      const parts = input.localityIds.map(id => `locality_id = ${id}`).join(' OR ');
      filters.push(`(${parts})`);
    }
  } else if (input.localityId !== undefined) {
    filters.push(`locality_id = ${input.localityId}`);
  }

  if (input.intent) {
    filters.push(`intent = "${input.intent}"`);
  }

  // Product rule: buy intent is restricted to apartment/flat only
  const propTypes = input.propertyType
    ? (Array.isArray(input.propertyType) ? input.propertyType : [input.propertyType])
    : [];

  if (input.intent === 'buy') {
    const allowed = propTypes.filter(pt => BUY_ALLOWED_PROPERTY_TYPES.includes(pt));
    if (allowed.length === 1) {
      filters.push(`property_type = "${allowed[0]}"`);
    } else if (allowed.length > 1) {
      const parts = allowed.map(pt => `property_type = "${pt}"`).join(' OR ');
      filters.push(`(${parts})`);
    } else {
      filters.push('(property_type = "apartment" OR property_type = "flat")');
    }
  } else if (propTypes.length === 1) {
    filters.push(`property_type = "${propTypes[0]}"`);
  } else if (propTypes.length > 1) {
    const parts = propTypes.map(pt => `property_type = "${pt}"`).join(' OR ');
    filters.push(`(${parts})`);
  }

  // Room type: supports single value or array
  if (input.roomType) {
    const roomTypes = Array.isArray(input.roomType) ? input.roomType : [input.roomType];
    if (roomTypes.length === 1) {
      filters.push(`room_type = "${roomTypes[0]}"`);
    } else if (roomTypes.length > 1) {
      const parts = roomTypes.map(rt => `room_type = "${rt}"`).join(' OR ');
      filters.push(`(${parts})`);
    }
  }

  if (input.foodIncluded === 'true') filters.push('food_included = true');
  if (input.gender && input.gender !== 'any') filters.push(`(gender_pref = "${input.gender}" OR gender_pref = "any")`);
  if (input.priceMin !== undefined) filters.push(`price >= ${input.priceMin}`);
  if (input.priceMax !== undefined) filters.push(`price <= ${input.priceMax}`);

  // Availability filter (available_from_ts: 0 = immediately available)
  if (input.availability === 'now') {
    const nowTs = Math.floor(Date.now() / 1000);
    filters.push(`available_from_ts <= ${nowTs}`);
  } else if (input.availability === 'soon') {
    const soonTs = Math.floor((Date.now() + 30 * 24 * 3600 * 1000) / 1000);
    filters.push(`available_from_ts <= ${soonTs}`);
  }

  // Preferred tenants filter: include listings that accept ANY of the selected types, or "any"
  if (input.preferredTenants && input.preferredTenants.length > 0) {
    const nonAny = input.preferredTenants.filter(t => t !== 'any');
    if (nonAny.length > 0) {
      const parts = [...nonAny, 'any'].map(t => `preferred_tenants = "${t}"`).join(' OR ');
      filters.push(`(${parts})`);
    }
  }

  // Furnishing filter: show listings matching any selected furnishing type
  if (input.furnishing && input.furnishing.length > 0) {
    if (input.furnishing.length === 1) {
      filters.push(`furnishing = "${input.furnishing[0]}"`);
    } else {
      const parts = input.furnishing.map(f => `furnishing = "${f}"`).join(' OR ');
      filters.push(`(${parts})`);
    }
  }

  return filters;
}
