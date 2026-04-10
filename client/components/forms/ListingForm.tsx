'use client';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  bhkRoomTypes,
  listingSchema,
  occupancyRoomTypes,
  type ListingFormValues,
  type ListingInput,
} from '@/lib/schemas/listing';
import { api } from '@/lib/api';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import SectionLabel from '@/components/ui/SectionLabel';
import ImageUploader from './ImageUploader';
import CompletenessBar from './CompletenessBar';

interface CityOption { id: number; name: string; slug: string; }
interface LocalityOption { id: number; name: string; slug: string; }

const AMENITY_OPTIONS = ['wifi', 'ac', 'laundry', 'parking', 'cctv', 'gym', 'kitchen', 'geyser', 'furnished', 'balcony'];

const PG_HOSTEL_ROOM_TYPES = occupancyRoomTypes.map((value) => ({
  value,
  label: value === 'multiple' ? 'Multiple Sharing' : value === 'double' ? 'Double Sharing' : 'Single',
}));

const APARTMENT_ROOM_TYPES = bhkRoomTypes.map((value) => ({
  value,
  label: value.toUpperCase(),
}));

function calcLocalScore(data: Partial<ListingFormValues>): number {
  let s = 0;
  const description = typeof data.description === 'string' ? data.description : '';
  const amenities = Array.isArray(data.amenities) ? data.amenities : [];
  const landmark = typeof data.landmark === 'string' ? data.landmark : '';
  const rules = typeof data.rules === 'string' ? data.rules : '';
  if (data.cityId) s += 10;
  if (data.localityId) s += 10;
  if (data.price) s += 5;
  if (data.roomType) s += 3;
  if (data.propertyType) s += 2;
  const imgs = data.images?.length ?? 0;
  if (imgs >= 1) s += 10;
  if (imgs >= 3) s += 10;
  if (imgs >= 6) s += 5;
  if (description.length >= 50) s += 10;
  if (description.length >= 150) s += 5;
  const am = amenities.length;
  if (am >= 1) s += 5;
  if (am >= 3) s += 5;
  if (am >= 5) s += 10;
  if (data.foodIncluded !== undefined) s += 3;
  if (data.genderPref) s += 3;
  if (rules) s += 2;
  if (landmark) s += 2;
  return Math.min(100, s);
}

interface ListingFormProps {
  initialData?: Partial<ListingInput>;
  listingId?: number;
}

export default function ListingForm({ initialData, listingId }: ListingFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const defaultValues = useMemo<Partial<ListingFormValues>>(() => {
    const normalizedInitialData: Partial<ListingFormValues> = {
      ...initialData,
      availableFrom:
        typeof initialData?.availableFrom === 'string'
          ? initialData.availableFrom.slice(0, 10)
          : undefined,
    };

    return {
      title: '',
      cityId: undefined,
      localityId: undefined,
      intent: 'rent',
      price: undefined,
      roomType: undefined,
      propertyType: undefined,
      deposit: undefined,
      areaSqft: undefined,
      availableFrom: undefined,
      furnishing: undefined,
      preferredTenants: 'any',
      description: undefined,
      landmark: undefined,
      address: undefined,
      foodIncluded: false,
      genderPref: 'any',
      amenities: [],
      rules: undefined,
      images: [],
      ...normalizedInitialData,
    };
  }, [initialData]);

  const {
    register,
    control,
    handleSubmit,
    reset,
    resetField,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues, unknown, ListingInput>({
    resolver: zodResolver(listingSchema),
    defaultValues,
  });

  const cityId = useWatch({ control, name: 'cityId' });
  const propertyType = useWatch({ control, name: 'propertyType' });
  const formValues = useWatch({ control });
  const score = calcLocalScore(formValues);

  const roomTypeOptions = useMemo(() => (
    propertyType === 'pg' || propertyType === 'hostel'
      ? PG_HOSTEL_ROOM_TYPES
      : propertyType === 'apartment' || propertyType === 'flat'
        ? APARTMENT_ROOM_TYPES
        : []
  ), [propertyType]);

  const { data: cityOptions = [] } = useQuery({
    queryKey: ['cities'],
    queryFn: () => api.get<{ data: CityOption[] }>('/cities').then((res) => res.data),
  });

  const { data: localityOptions = [] } = useQuery({
    queryKey: ['localities', cityId],
    queryFn: () => api.get<{ data: LocalityOption[] }>(`/localities?cityId=${cityId}`).then((res) => res.data),
    enabled: !!cityId,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  useEffect(() => {
    if (!propertyType) {
      return;
    }

    const allowedRoomTypes = roomTypeOptions.map((option) => option.value);
    if (formValues.roomType && !allowedRoomTypes.includes(formValues.roomType)) {
      resetField('roomType');
    }
  }, [formValues.roomType, propertyType, resetField, roomTypeOptions]);

  const onSubmit = async (data: ListingInput) => {
    setServerError(null);
    try {
      if (listingId) {
        await api.put(`/listings/${listingId}`, data);
      } else {
        await api.post('/listings', data);
      }
      router.push('/dashboard/listings');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-12 max-w-2xl">
      <CompletenessBar score={score} />

      <section>
        <SectionLabel>Basic Details</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Listing Title *
            </label>
            <Input placeholder="e.g. Furnished Single Room near MG Road" {...register('title')} />
            {errors.title && <p className="font-sans text-xs text-red-600 mt-1">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                City *
              </label>
              <Controller
                name="cityId"
                control={control}
                render={({ field }) => (
                  <select
                    className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    value={typeof field.value === 'number' ? field.value : ''}
                    onChange={e => {
                      field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined);
                      setValue('localityId', undefined);
                    }}
                  >
                    <option value="">{cityOptions.length > 0 ? 'Select city...' : 'Loading cities...'}</option>
                    {cityOptions.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.cityId && <p className="font-sans text-xs text-red-600 mt-1">{errors.cityId.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Locality *
              </label>
              <Controller
                name="localityId"
                control={control}
                render={({ field }) => (
                  <select
                    className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                    value={typeof field.value === 'number' ? field.value : ''}
                    onChange={e => field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    disabled={!cityId || localityOptions.length === 0}
                  >
                    <option value="">
                      {!cityId ? 'Select city first' : localityOptions.length > 0 ? 'Select locality...' : 'No localities available'}
                    </option>
                    {localityOptions.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                )}
              />
              {errors.localityId && <p className="font-sans text-xs text-red-600 mt-1">{errors.localityId.message}</p>}
            </div>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Listing Intent *
            </label>
            <select
              className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('intent')}
            >
              <option value="rent">For Rent</option>
              <option value="buy">For Sale</option>
            </select>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Landmark (optional)
            </label>
            <Input placeholder="e.g. Near Forum Mall" {...register('landmark')} />
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Monthly Rent (₹) *
            </label>
            <Input type="number" placeholder="8000" {...register('price')} />
            {errors.price && <p className="font-sans text-xs text-red-600 mt-1">{errors.price.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Property Type *
              </label>
              <select
                className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('propertyType')}
              >
                <option value="">Select...</option>
                <option value="pg">PG</option>
                <option value="hostel">Hostel</option>
                <option value="apartment">Apartment</option>
                <option value="flat">Flat</option>
              </select>
              {errors.propertyType && <p className="font-sans text-xs text-red-600 mt-1">{errors.propertyType.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Room Type *
              </label>
              <select
                className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('roomType')}
                disabled={roomTypeOptions.length === 0}
              >
                <option value="">{propertyType ? 'Select...' : 'Select property type first'}</option>
                {roomTypeOptions.map(rt => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
              {errors.roomType && <p className="font-sans text-xs text-red-600 mt-1">{errors.roomType.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Deposit (₹, optional)
              </label>
              <Input type="number" placeholder="e.g. 20000" {...register('deposit')} />
              {errors.deposit && <p className="font-sans text-xs text-red-600 mt-1">{errors.deposit.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Area (sq ft, optional)
              </label>
              <Input type="number" placeholder="e.g. 350" {...register('areaSqft')} />
              {errors.areaSqft && <p className="font-sans text-xs text-red-600 mt-1">{errors.areaSqft.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Available From (optional)
              </label>
              <Input type="date" {...register('availableFrom')} />
              {errors.availableFrom && <p className="font-sans text-xs text-red-600 mt-1">{errors.availableFrom.message}</p>}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Furnishing
              </label>
              <select
                className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('furnishing')}
              >
                <option value="">Not specified</option>
                <option value="furnished">Furnished</option>
                <option value="semi">Semi-furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
              {errors.furnishing && <p className="font-sans text-xs text-red-600 mt-1">{errors.furnishing.message}</p>}
            </div>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Preferred Tenants
            </label>
            <select
              className="h-12 w-full px-4 bg-transparent border border-input rounded-md font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
              {...register('preferredTenants')}
            >
              <option value="any">Any</option>
              <option value="students">Students</option>
              <option value="working">Working Professionals</option>
              <option value="family">Family</option>
            </select>
            {errors.preferredTenants && <p className="font-sans text-xs text-red-600 mt-1">{errors.preferredTenants.message}</p>}
          </div>
        </div>
      </section>

      <section>
        <SectionLabel>Photos</SectionLabel>
        <Controller
          name="images"
          control={control}
          render={({ field }) => (
            <ImageUploader images={field.value ?? []} onChange={field.onChange} />
          )}
        />
      </section>

      <section>
        <SectionLabel>More Details</SectionLabel>
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the room, neighbourhood, and what makes it great..."
              {...register('description')}
              className="w-full px-4 py-3 bg-transparent border border-input rounded-md font-sans text-base resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {errors.description && <p className="font-sans text-xs text-red-600 mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-3 block">
              Amenities
            </label>
            <Controller
              name="amenities"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {AMENITY_OPTIONS.map(a => (
                    <label key={a} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(field.value ?? []).includes(a)}
                        onChange={e =>
                          field.onChange(
                            e.target.checked
                              ? [...(field.value ?? []), a]
                              : (field.value ?? []).filter(x => x !== a)
                          )
                        }
                        className="accent-accent w-4 h-4"
                      />
                      <span className="font-sans text-sm capitalize">{a}</span>
                    </label>
                  ))}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="foodIncluded"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={e => field.onChange(e.target.checked)}
                    className="accent-accent w-4 h-4"
                  />
                  <span className="font-sans text-sm">Food Included</span>
                </label>
              )}
            />
            <div>
              <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
                Gender Preference
              </label>
              <select
                className="h-10 w-full px-3 bg-transparent border border-input rounded-md font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                {...register('genderPref')}
              >
                <option value="any">Any</option>
                <option value="male">Male Only</option>
                <option value="female">Female Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground mb-2 block">
              House Rules
            </label>
            <textarea
              rows={2}
              placeholder="e.g. No smoking, No pets, Visitors allowed till 10pm..."
              {...register('rules')}
              className="w-full px-4 py-3 bg-transparent border border-input rounded-md font-sans text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </section>

      {serverError && <p className="font-sans text-sm text-red-600">{serverError}</p>}
      <div className="flex gap-4 pt-4 border-t border-border">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : listingId ? 'Save Changes' : 'Publish Listing'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
