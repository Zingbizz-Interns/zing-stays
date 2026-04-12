import type { ListingCardData, SearchListingHit } from './types';

export function mapSearchHit(hit: SearchListingHit): ListingCardData {
  return {
    id: hit.id,
    ownerId: hit.owner_id ?? 0,
    title: hit.title,
    city: hit.city,
    locality: hit.locality,
    citySlug: hit.city_slug,
    localitySlug: hit.locality_slug,
    intent: hit.intent,
    price: hit.price,
    deposit: hit.deposit,
    areaSqft: hit.area_sqft,
    availableFrom: hit.available_from_ts && hit.available_from_ts > 0
      ? new Date(hit.available_from_ts * 1000).toISOString()
      : null,
    furnishing: hit.furnishing,
    preferredTenants: hit.preferred_tenants,
    genderPref: hit.gender_pref,
    landmark: hit.landmark,
    roomType: hit.room_type,
    propertyType: hit.property_type,
    images: hit.images ?? [],
    badges: hit.badges ?? [],
    foodIncluded: hit.food_included,
  };
}
