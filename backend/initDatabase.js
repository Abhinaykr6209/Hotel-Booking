require('dotenv').config();
const { Client } = require('pg');
const pool = require('./db');

const DB_NAME = process.env.DB_NAME || 'hotel_db';

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS hotels (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(150)  NOT NULL,
    description TEXT          NOT NULL,
    image_path  VARCHAR(255),
    latitude    NUMERIC(9,6)  NOT NULL,
    longitude   NUMERIC(9,6)  NOT NULL,
    price       NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    rating      NUMERIC(2,1)  NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
    created_at  TIMESTAMP     DEFAULT NOW()
  );

  ALTER TABLE hotels
    ADD COLUMN IF NOT EXISTS rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

  CREATE INDEX IF NOT EXISTS idx_hotels_title ON hotels (LOWER(title));
  CREATE INDEX IF NOT EXISTS idx_hotels_price ON hotels (price);
`;

async function createDatabaseIfMissing() {

  if (!/^[A-Za-z0-9_]+$/.test(DB_NAME)) {
    throw new Error('DB_NAME may only contain letters, numbers and underscores');
  }

  const admin = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: 'postgres',
  });

  await admin.connect();
  try {
    const { rowCount } = await admin.query('SELECT 1 FROM pg_database WHERE datname = $1', [DB_NAME]);
    if (rowCount === 0) {
      await admin.query(`CREATE DATABASE "${DB_NAME}"`);
      console.log(`Database "${DB_NAME}" created`);
    }
  } finally {
    await admin.end();
  }
}

async function initDatabase() {
  await createDatabaseIfMissing();
  await pool.query(CREATE_TABLE_SQL);
  console.log('Database ready (table "hotels" exists)');
}

module.exports = { initDatabase };
