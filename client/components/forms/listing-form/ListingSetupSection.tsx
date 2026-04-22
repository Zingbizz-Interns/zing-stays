import { Controller, type Control, type FieldErrors, type UseFormResetField } from 'react-hook-form';
import SectionLabel from '@/components/ui/SectionLabel';
import Button from '@/components/ui/Button';
import type { ListingFormValues, ListingInput } from '@/lib/schemas/listing';
import type { CityOption } from './shared';

interface ListingSetupSectionProps {
  control: Control<ListingFormValues, unknown, ListingInput>;
  errors: FieldErrors<ListingFormValues>;
  cityOptions: CityOption[];
  intent: ListingFormValues['intent'];
  onContinue: () => void;
  continuing: boolean;
  resetField: UseFormResetField<ListingFormValues>;
}

export default function ListingSetupSection({
  control,
  errors,
  cityOptions,
  intent,
  onContinue,
  continuing,
  resetField,
}: ListingSetupSectionProps) {
  return (
    <section className="space-y-6 rounded-2xl border border-border bg-card p-6">
      <div className="space-y-2">
        <SectionLabel>Listing Setup</SectionLabel>
        <h2 className="font-display text-2xl">Start with the essentials</h2>
        <p className="font-sans text-sm text-muted-foreground">
          Choose the listing intent, city, and property type first. The rest of the form will adapt around them.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Listing Intent *
          </label>
          <Controller
            name="intent"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                    field.value === 'rent'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/40'
                  }`}
                  onClick={() => {
                    field.onChange('rent');
                    resetField('propertyType');
                    resetField('roomType');
                  }}
                >
                  <span className="block font-sans text-base font-semibold">For Rent</span>
                  <span className="mt-1 block font-sans text-sm text-muted-foreground">
                    PGs, hostels, flats, and apartments with monthly pricing.
                  </span>
                </button>
                <button
                  type="button"
                  className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                    field.value === 'buy'
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/40'
                  }`}
                  onClick={() => {
                    field.onChange('buy');
                    resetField('propertyType');
                    resetField('roomType');
                  }}
                >
                  <span className="block font-sans text-base font-semibold">For Sale</span>
                  <span className="mt-1 block font-sans text-sm text-muted-foreground">
                    Sale listings with ownership pricing and buyer-focused details.
                  </span>
                </button>
              </div>
            )}
          />
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
            City *
          </label>
          <Controller
            name="cityId"
            control={control}
            render={({ field }) => (
              <select
                className="h-12 w-full rounded-md border border-input bg-transparent px-4 font-sans text-base focus:outline-none focus:ring-2 focus:ring-ring"
                value={typeof field.value === 'number' ? field.value : ''}
                onChange={(e) => {
                  field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined);
                  resetField('localityId');
                }}
              >
                <option value="">{cityOptions.length > 0 ? 'Select city...' : 'Loading cities...'}</option>
                {cityOptions.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.cityId && <p className="mt-1 font-sans text-xs text-red-600">{errors.cityId.message}</p>}
        </div>

        <div>
          <label className="mb-2 block font-mono text-xs uppercase tracking-[0.1em] text-muted-foreground">
            Property Type *
          </label>
          <Controller
            name="propertyType"
            control={control}
            render={({ field }) => {
              const options =
                intent === 'buy'
                  ? [
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'flat', label: 'Flat' },
                    ]
                  : [
                      { value: 'pg', label: 'PG' },
                      { value: 'hostel', label: 'Hostel' },
                      { value: 'apartment', label: 'Apartment' },
                      { value: 'flat', label: 'Flat' },
                    ];

              return (
                <div className="grid grid-cols-2 gap-3">
                  {options.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                        field.value === option.value
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/40'
                      }`}
                      onClick={() => {
                        field.onChange(option.value);
                        resetField('roomType');
                      }}
                    >
                      <span className="block font-sans text-base font-semibold">{option.label}</span>
                    </button>
                  ))}
                </div>
              );
            }}
          />
          {errors.propertyType && <p className="mt-1 font-sans text-xs text-red-600">{errors.propertyType.message}</p>}
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-4">
        <Button type="button" onClick={onContinue} disabled={continuing}>
          {continuing ? 'Continuing...' : 'Continue to Details'}
        </Button>
      </div>
    </section>
  );
}
