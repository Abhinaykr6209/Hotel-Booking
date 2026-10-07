const fs = require('fs');
const path = require('path');
const pool = require('./db');

const SAMPLE_HOTELS = [
  {
    title: 'Grand Palace Hotel',
    description: 'Elegant city with spacious rooms, a rooftop restaurant and free breakfast. A short walk from the main market and bus stand.',
    image: '1st image.jpg',
    latitude: 11.6643, longitude: 78.1460, price: 2500 , rating: 4.3,
  },
  {
    title: 'Yercaud Hillview Resort',
    description: 'Peaceful hill-station resort surrounded by coffee estates. Enjoy misty mornings, a garden cafe, bonfire evenings and guided nature walks.',
    image: '2nd image.jpg',
    latitude: 11.7753, longitude: 78.2090, price: 3200, rating: 4.5,
  },
  {
    title: 'Marina Beach Resort',
    description: 'Beachfront resort in Chennai with sea-facing rooms, a swimming pool, spa and live seafood grill. Perfect for family weekends.',
    image: '3rd image.jpg',
    latitude: 13.0500, longitude: 80.2824, price: 4500, rating: 4.2,
  },
  {
    title: 'Ooty Lake View Inn',
    description: 'Cozy budget inn beside Ooty Lake. Rooms have wooden interiors and lake views, with a warm fireplace lounge and hot tea all day.',
    image: '4th image.jpg',
    latitude: 11.4064, longitude: 76.6932, price: 1800, rating: 4.0,
  },
  {
    title: 'Kodaikanal Mist Cottage',
    description: 'Charming cottage stay among pine trees and cloud-covered hills. Includes a private balcony, home-cooked meals and easy access to Coakers Walk.',
    image: '5th image.jpg',
    latitude: 10.2381, longitude: 77.4892, price: 2200, rating: 4.4,
  },
  {
    title: 'Mahabalipuram Shore Stay',
    description: 'Relaxed seaside stay a few minutes from the Shore Temple. Sea-breeze terrace, fresh seafood restaurant and bicycles for guests.',
    image: '6th image.jpg',
    latitude: 12.6169, longitude: 80.1993, price: 3800, rating: 4.6,
  },
  {
    title: 'Meenakshi Residency',
    description: 'Comfortable family hotel close to the Meenakshi Amman Temple in Madurai. Vegetarian restaurant, air-conditioned rooms and airport pickup.',
    image: '7th image.jpg',
    latitude: 9.9195, longitude: 78.1193, price: 2000, rating: 3.9,
  },
  {
    title: 'City Central Coimbatore',
    description: 'Modern business hotel near the railway junction with fast Wi-Fi, a work lounge, a gym and a 24-hour coffee shop.',
    image: '8th image.jpg',
    latitude: 11.0168, longitude: 76.9558, price: 1500, rating: 3.7,
  },
  {
    title: 'Pondicherry French Villa',
    description: 'Restored heritage villa in the French Quarter with colourful courtyards, a boutique cafe and rooms just minutes from the promenade.',
    image: '9th image.jpg',
    latitude: 11.9416, longitude: 79.8083, price: 5200, rating: 4.7,
  },
];

// insert all demo hotels
async function insertSamples() {
  const uploadsDir = path.join(__dirname, 'uploads');
  fs.mkdirSync(uploadsDir, { recursive: true });

  for (const h of SAMPLE_HOTELS) {
    // copy the image to upload
    const fileName = `seed-${h.image}`;
    fs.copyFileSync(path.join(__dirname, 'seed-images', h.image), path.join(uploadsDir, fileName));

    await pool.query(
      `INSERT INTO hotels (title, description, image_path, latitude, longitude, price, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [h.title, h.description, `/uploads/${fileName}`, h.latitude, h.longitude, h.price, h.rating]
    );
  }
}


async function seedWhenEmpty() {
  const { rows } = await pool.query('SELECT COUNT(*) FROM hotels');
  if (Number(rows[0].count) > 0) return false;
  await insertSamples();
  return true;
}

async function seedIfEmpty() {
  if (String(process.env.SEED_SAMPLE_DATA).toLowerCase() === 'false') return;
  if (await seedWhenEmpty()) console.log(`Added ${SAMPLE_HOTELS.length} sample hotels`);
}

async function resetAndSeed() {
  const { rows } = await pool.query('SELECT image_path FROM hotels');
  await pool.query('TRUNCATE hotels RESTART IDENTITY');
  for (const r of rows) {
    if (r.image_path && r.image_path.startsWith('/uploads/')) {
      fs.unlink(path.join(__dirname, r.image_path), () => {}); // ignore if already gone
    }
  }
  await insertSamples();
}

module.exports = { seedIfEmpty, seedWhenEmpty, resetAndSeed, SAMPLE_HOTELS };
