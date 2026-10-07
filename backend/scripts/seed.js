require('dotenv').config();
const pool = require('../db');
const { initDatabase } = require('../initDatabase');
const { seedWhenEmpty, resetAndSeed, SAMPLE_HOTELS } = require('../seedData');

const reset = process.argv.includes('--reset');

(async () => {
  try {
    await initDatabase(); // make sure db + table exist

    if (reset) {
      await resetAndSeed();
      console.log(`Reset done: all old hotels removed, ${SAMPLE_HOTELS.length} sample hotels added.`);
    } else if (await seedWhenEmpty()) {
      console.log(`Added ${SAMPLE_HOTELS.length} sample hotels.`);
    } else {
      console.log('The hotels table already has data, so nothing was added.');
      console.log('To delete everything and load the sample hotels, run:  npm run seed:reset');
    }
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
})();
