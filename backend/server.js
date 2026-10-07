require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./initDatabase');
const { seedIfEmpty } = require('./seedData');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/hotels', require('./routes/hotelRoutes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  let message = err.message || 'Server error';
  if (err.code === 'LIMIT_FILE_SIZE') message = 'Image must be under 2MB';
  res.status(err.status || 400).json({ errors: [message] });
});

const PORT = process.env.PORT || 5000;

initDatabase()
  .then(seedIfEmpty)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Database setup failed:', err.message);
    console.error('Check that PostgreSQL is running and that DB_USER / DB_PASSWORD / DB_HOST / DB_PORT in .env are correct.');
    process.exit(1);
  });
