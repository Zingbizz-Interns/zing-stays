export interface ListingCardData {
  id: number;
  title: string;
  city: string;
  locality: string;
  citySlug?: string | null;
  localitySlug?: string | null;
  cityId?: number | null;
  localityId?: number | null;
  ownerId?: number;
  intent: 'buy' | 'rent';
  price: number;
  deposit?: number | null;
  areaSqft?: number | null;
  availableFrom?: string | null;
  furnishing?: string | null;
  preferredTenants?: string | null;
  genderPref?: string | null;
  landmark?: string | null;
  roomType: string;
  propertyType: string;
  images: string[];
  badges: string[];
  foodIncluded: boolean;
}

export interface SearchListingHit {
  id: number;
  owner_id?: number;
  title: string;
  city: string;
  locality: string;
  city_slug?: string;
  locality_slug?: string;
  intent: 'buy' | 'rent';
  price: number;
  deposit?: number;
  area_sqft?: number;
  available_from_ts?: number;
  furnishing?: string;
  preferred_tenants?: string;
  gender_pref?: string;
  landmark?: string;
  room_type: string;
  property_type: string;
  food_included: boolean;
  images?: string[];
  badges?: string[];
}

export interface OwnerListing extends ListingCardData {
  completenessScore: number;
  status: 'draft' | 'active' | 'inactive';
}

export interface AdminListing {
  id: number;
  title: string;
  city: string;
  status: 'draft' | 'active' | 'inactive';
  completenessScore: number;
}
