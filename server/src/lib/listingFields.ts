export const occupancyRoomTypes = ['single', 'double', 'multiple'] as const;
export const bhkRoomTypes = ['1bhk', '2bhk', '3bhk', '4bhk'] as const;
export const roomTypeValues = [...occupancyRoomTypes, ...bhkRoomTypes] as const;

export const propertyTypeValues = ['pg', 'hostel', 'apartment', 'flat'] as const;
export const furnishingValues = ['furnished', 'semi', 'unfurnished'] as const;
export const preferredTenantValues = ['students', 'working', 'family', 'any'] as const;
export const intentValues = ['buy', 'rent'] as const;
export const genderValues = ['male', 'female', 'any'] as const;

export type RoomType = (typeof roomTypeValues)[number];
export type PropertyType = (typeof propertyTypeValues)[number];
export type Furnishing = (typeof furnishingValues)[number];
export type PreferredTenant = (typeof preferredTenantValues)[number];
export type ListingIntent = (typeof intentValues)[number];
export type GenderPref = (typeof genderValues)[number];

export function isRoomTypeAllowedForPropertyType(
  roomType: RoomType,
  propertyType: PropertyType,
): boolean {
  if (propertyType === 'pg' || propertyType === 'hostel') {
    return occupancyRoomTypes.includes(roomType as (typeof occupancyRoomTypes)[number]);
  }

  return bhkRoomTypes.includes(roomType as (typeof bhkRoomTypes)[number]);
}
