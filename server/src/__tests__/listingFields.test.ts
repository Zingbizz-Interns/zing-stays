import assert from 'node:assert/strict';
import { isRoomTypeAllowedForPropertyType } from '../lib/listingFields';

export function runListingFieldTests(): void {
  assert.equal(isRoomTypeAllowedForPropertyType('single', 'pg'), true);
  assert.equal(isRoomTypeAllowedForPropertyType('multiple', 'hostel'), true);
  assert.equal(isRoomTypeAllowedForPropertyType('2bhk', 'apartment'), true);
  assert.equal(isRoomTypeAllowedForPropertyType('4bhk', 'flat'), true);

  assert.equal(isRoomTypeAllowedForPropertyType('1bhk', 'pg'), false);
  assert.equal(isRoomTypeAllowedForPropertyType('multiple', 'flat'), false);
}
