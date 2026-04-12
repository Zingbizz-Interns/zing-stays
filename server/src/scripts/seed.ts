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
      localities: [
        'Koramangala', 'Indiranagar', 'HSR Layout', 'Whitefield', 'Electronic City',
        'Bellandur', 'Marathahalli', 'BTM Layout', 'JP Nagar', 'Jayanagar',
        'Hebbal', 'Yelahanka', 'Sarjapur Road', 'Bannerghatta Road', 'Rajajinagar',
        'Malleshwaram', 'Vijayanagar', 'RT Nagar', 'Nagarbhavi', 'Basavanagudi',
      ],
    },
    {
      city: { name: 'Hyderabad', state: 'Telangana' },
      localities: [
        'Madhapur', 'Gachibowli', 'Kondapur', 'Begumpet', 'Hitech City',
        'Banjara Hills', 'Jubilee Hills', 'Kukatpally', 'Miyapur', 'Ameerpet',
        'Secunderabad', 'Uppal', 'LB Nagar', 'Dilsukhnagar', 'Mehdipatnam',
        'Tolichowki', 'Manikonda', 'Nanakramguda', 'Shamshabad', 'Kompally',
      ],
    },
    {
      city: { name: 'Chennai', state: 'Tamil Nadu' },
      localities: [
        'Adambakkam', 'Adyar', 'Alandur', 'Ambattur', 'Aminjikarai',
        'Anna Nagar', 'Arumbakkam', 'Ashok Nagar', 'Avadi', 'Besant Nagar',
        'Chengalpattu', 'Chetpet', 'Chromepet', 'Egmore', 'Ekkatuthangal',
        'Guindy', 'Injambakkam', 'Iyyappanthangal', 'Karapakkam', 'Kelambakkam',
        'Kodambakkam', 'Kolathur', 'Korattur', 'Kottivakkam', 'Koyambedu',
        'Madipakkam', 'Mambalam', 'Medavakkam', 'Mogappair', 'Mylapore',
        'Nandanam', 'Navalur', 'Nungambakkam', 'OMR', 'Pallavaram',
        'Perambur', 'Perungudi', 'Poonamallee', 'Porur', 'Purasawalkam',
        'Royapettah', 'Saidapet', 'Sholinganallur', 'Tambaram', 'T Nagar',
        'Thirumangalam', 'Thiruvanmiyur', 'Triplicane', 'Vadapalani', 'Valasaravakkam',
        'Velachery', 'Villivakkam', 'Virugambakkam', 'Washermanpet',
      ],
    },
    {
      city: { name: 'Coimbatore', state: 'Tamil Nadu' },
      localities: [
        'Anaikatti', 'Avinashi Road', 'Cheran Ma Nagar', 'Eachanari', 'Ganapathy',
        'Gandhipuram', 'Gopalapuram', 'Hopes College', 'Kalapatti', 'Kaniyur',
        'Karumathampatti', 'Kinathukadavu', 'Kovaipudur', 'Kuniamuthur', 'Kurichi',
        'Mettupalayam Road', 'Neelambur', 'Ondipudur', 'Peelamedu', 'Podanur',
        'Pollachi Road', 'R S Puram', 'Race Course', 'Ramanathapuram', 'Saibaba Colony',
        'Saravanampatti', 'Selvapuram', 'Singanallur', 'Sivananda Colony', 'Sowripalayam',
        'Sundarapuram', 'Thadagam Road', 'Thondamuthur', 'Thudiyalur', 'Ukkadam',
        'Vadavalli', 'Veerakeralam', 'Vilankurichi',
      ],
    },
    {
      city: { name: 'Mumbai', state: 'Maharashtra' },
      localities: [
        'Airoli', 'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West',
        'Belapur', 'Bhandup', 'Bhayandar', 'Borivali East', 'Borivali West',
        'Byculla', 'Chembur', 'Colaba', 'Dadar East', 'Dadar West',
        'Dahisar', 'Fort', 'Ghatkopar East', 'Ghatkopar West', 'Girgaon',
        'Goregaon East', 'Goregaon West', 'Jogeshwari East', 'Jogeshwari West', 'Juhu',
        'Kalyan', 'Kandivali East', 'Kandivali West', 'Kanjurmarg', 'Khar',
        'Kurla', 'Lower Parel', 'Mahalakshmi', 'Malad East', 'Malad West',
        'Marine Lines', 'Matunga', 'Mira Road', 'Mulund', 'Navi Mumbai',
        'Nerul', 'Panvel', 'Parel', 'Powai', 'Prabhadevi',
        'Santacruz East', 'Santacruz West', 'Seawoods', 'Sion', 'Thane',
        'Vashi', 'Vasai', 'Vikhroli', 'Vile Parle', 'Wadala',
        'Worli',
      ],
    },
    {
      city: { name: 'Pune', state: 'Maharashtra' },
      localities: [
        'Aundh', 'Balewadi', 'Baner', 'Bavdhan', 'Bibwewadi',
        'Camp', 'Chandan Nagar', 'Chinchwad', 'Deccan', 'Dhankawadi',
        'Dhanori', 'Erandwane', 'Fursungi', 'Hadapsar', 'Hinjewadi',
        'Kalyani Nagar', 'Karve Nagar', 'Katraj', 'Kharadi', 'Kondhwa',
        'Koregaon Park', 'Kothrud', 'Magarpatta', 'Mundhwa', 'NIBM Road',
        'Nigdi', 'Pashan', 'Pimple Gurav', 'Pimple Nilakh', 'Pimple Saudagar',
        'Pimpri', 'Ravet', 'Shivajinagar', 'Sinhagad Road', 'Sus',
        'Swargate', 'Tathawade', 'Undri', 'Vadgaon Sheri', 'Viman Nagar',
        'Wadgaon Budruk', 'Wagholi', 'Wakad', 'Wanowrie', 'Warje',
       'Yerawada',
      ],
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
    const sorted = [...sameCityLocalities].sort((a, b) => a.name.localeCompare(b.name));
    const pairs: { localityId: number; neighborId: number }[] = [];

    for (let index = 0; index < sorted.length; index += 1) {
      const locality = sorted[index]!;
      const windowStart = Math.max(0, index - 3);
      const windowEnd = Math.min(sorted.length - 1, index + 3);

      for (let neighborIndex = windowStart; neighborIndex <= windowEnd; neighborIndex += 1) {
        if (neighborIndex === index) {
          continue;
        }

        const neighbor = sorted[neighborIndex]!;
        pairs.push({
          localityId: locality.id,
          neighborId: neighbor.id,
        });
      }
    }

    const batchSize = 200;
    for (let index = 0; index < pairs.length; index += batchSize) {
      await db
        .insert(localityNeighbors)
        .values(pairs.slice(index, index + batchSize))
        .onConflictDoNothing();
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
