import 'dotenv/config';
import { db } from '../db';
import { cities, localities, localityNeighbors, users } from '../db/schema';

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

async function seedCitiesAndLocalities(): Promise<void> {
  const seedData = [
    {
      city: { name: 'Bangalore', state: 'Karnataka' },
      localities: ['Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield'],
    },
    {
      city: { name: 'Hyderabad', state: 'Telangana' },
      localities: ['Madhapur', 'Gachibowli', 'Kondapur', 'Begumpet'],
    },
  ];

  for (const entry of seedData) {
    const [city] = await db
      .insert(cities)
      .values({
        name: entry.city.name,
        slug: slugify(entry.city.name),
        state: entry.city.state,
        isActive: true,
      })
      .onConflictDoUpdate({
        target: cities.slug,
        set: { state: entry.city.state, isActive: true },
      })
      .returning({ id: cities.id });

    for (const localityName of entry.localities) {
      await db
        .insert(localities)
        .values({
          cityId: city.id,
          name: localityName,
          slug: slugify(localityName),
          isActive: true,
        })
        .onConflictDoNothing();
    }
  }
}

async function seedLocalityNeighbors(): Promise<void> {
  const localityRows = await db.select().from(localities);
  const byCity = new Map<number, typeof localityRows>();

  for (const locality of localityRows) {
    const group = byCity.get(locality.cityId) ?? [];
    group.push(locality);
    byCity.set(locality.cityId, group);
  }

  for (const sameCityLocalities of byCity.values()) {
    for (const locality of sameCityLocalities) {
      for (const neighbor of sameCityLocalities) {
        if (locality.id === neighbor.id) {
          continue;
        }

        await db
          .insert(localityNeighbors)
          .values({
            localityId: locality.id,
            neighborId: neighbor.id,
          })
          .onConflictDoNothing();
      }
    }
  }
}

async function seedAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!adminEmail) {
    throw new Error('ADMIN_EMAIL environment variable is required');
  }

  await db
    .insert(users)
    .values({
      email: adminEmail,
      isAdmin: true,
      name: 'Admin',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { isAdmin: true, name: 'Admin' },
    });
}

async function main(): Promise<void> {
  await seedCitiesAndLocalities();
  await seedLocalityNeighbors();
  await seedAdminUser();
  console.log('Seed complete.');
}

main().catch((error) => {
  console.error('seed failed:', error);
  process.exitCode = 1;
});
