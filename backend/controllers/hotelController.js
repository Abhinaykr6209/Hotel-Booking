const fs = require('fs');
const path = require('path');
const pool = require('../db');

// remove an image from the uploads folder, e.g. "/uploads/123.jpg"
const removeFile = (imgPath) => {
  if (!imgPath) return;
  fs.unlink(path.join(__dirname, '..', imgPath), () => {});
};

const isBlank = (v) => v === undefined || v === null || String(v).trim() === '';

// returns a list of error messages, empty if everything is fine
const validate = (body, file, isCreate) => {
  const errors = [];
  const { title, description, latitude, longitude, price, rating } = body;

  if (isBlank(title) || String(title).trim().length < 3) errors.push('Title must be at least 3 characters');
  if (isBlank(description) || String(description).trim().length < 10) errors.push('Description must be at least 10 characters');

  if (isBlank(latitude) || isNaN(latitude) || Number(latitude) < -90 || Number(latitude) > 90)
    errors.push('Latitude must be a number between -90 and 90');
  if (isBlank(longitude) || isNaN(longitude) || Number(longitude) < -180 || Number(longitude) > 180)
    errors.push('Longitude must be a number between -180 and 180');
  if (isBlank(price) || isNaN(price) || Number(price) <= 0) errors.push('Price must be a number greater than 0');
  if (isBlank(rating) || isNaN(rating) || Number(rating) < 0 || Number(rating) > 5)
    errors.push('Rating must be a number between 0 and 5');

  if (isCreate && !file) errors.push('Image is required');
  return errors;
};

// GET /api/hotels?title=&minPrice=&maxPrice=&limit=6&offset=0
exports.getHotels = async (req, res, next) => {
  try {
    const { title, minPrice, maxPrice } = req.query;
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 6, 1), 50);
    const offset = Math.max(parseInt(req.query.offset) || 0, 0);

    // build the WHERE part depending on which filters were sent
    const where = [];
    const values = [];
    if (title && title.trim()) { values.push(`%${title.trim()}%`); where.push(`title ILIKE $${values.length}`); }
    if (!isBlank(minPrice) && !isNaN(minPrice)) { values.push(minPrice); where.push(`price >= $${values.length}`); }
    if (!isBlank(maxPrice) && !isNaN(maxPrice)) { values.push(maxPrice); where.push(`price <= $${values.length}`); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const count = await pool.query(`SELECT COUNT(*) FROM hotels ${clause}`, values);

    const pageValues = [...values, limit, offset];
    const rows = await pool.query(
      `SELECT * FROM hotels ${clause}
       ORDER BY id DESC
       LIMIT $${pageValues.length - 1} OFFSET $${pageValues.length}`,
      pageValues
    );

    res.json({ total: Number(count.rows[0].count), data: rows.rows });
  } catch (e) { next(e); }
};

// GET /api/hotels/:id
exports.getHotel = async (req, res, next) => {
  try {
    if (isNaN(req.params.id)) return res.status(400).json({ errors: ['Invalid hotel id'] });
    const { rows } = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    if (!rows.length) return res.status(404).json({ errors: ['Hotel not found'] });
    res.json(rows[0]);
  } catch (e) { next(e); }
};

// POST /api/hotels
exports.createHotel = async (req, res, next) => {
  try {
    const errors = validate(req.body, req.file, true);
    if (errors.length) {
      if (req.file) removeFile('/uploads/' + req.file.filename); // don't leave the file behind
      return res.status(400).json({ errors });
    }
    const { title, description, latitude, longitude, price, rating } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO hotels (title, description, image_path, latitude, longitude, price, rating)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [title.trim(), description.trim(), '/uploads/' + req.file.filename, latitude, longitude, price, rating]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    if (req.file) removeFile('/uploads/' + req.file.filename);
    next(e);
  }
};

// PUT /api/hotels/:id - image is optional, a new one replaces the old
exports.updateHotel = async (req, res, next) => {
  try {
    if (isNaN(req.params.id)) {
      if (req.file) removeFile('/uploads/' + req.file.filename);
      return res.status(400).json({ errors: ['Invalid hotel id'] });
    }
    const errors = validate(req.body, req.file, false);
    if (errors.length) {
      if (req.file) removeFile('/uploads/' + req.file.filename);
      return res.status(400).json({ errors });
    }

    const old = await pool.query('SELECT image_path FROM hotels WHERE id = $1', [req.params.id]);
    if (!old.rows.length) {
      if (req.file) removeFile('/uploads/' + req.file.filename);
      return res.status(404).json({ errors: ['Hotel not found'] });
    }

    const { title, description, latitude, longitude, price, rating } = req.body;
    const imagePath = req.file ? '/uploads/' + req.file.filename : old.rows[0].image_path;

    const { rows } = await pool.query(
      `UPDATE hotels
         SET title = $1, description = $2, image_path = $3, latitude = $4, longitude = $5, price = $6, rating = $7
       WHERE id = $8
       RETURNING *`,
      [title.trim(), description.trim(), imagePath, latitude, longitude, price, rating, req.params.id]
    );

    if (req.file) removeFile(old.rows[0].image_path); // delete the old image
    res.json(rows[0]);
  } catch (e) {
    if (req.file) removeFile('/uploads/' + req.file.filename);
    next(e);
  }
};

// DELETE /api/hotels/:id
exports.deleteHotel = async (req, res, next) => {
  try {
    if (isNaN(req.params.id)) return res.status(400).json({ errors: ['Invalid hotel id'] });
    const { rows } = await pool.query('DELETE FROM hotels WHERE id = $1 RETURNING image_path', [req.params.id]);
    if (!rows.length) return res.status(404).json({ errors: ['Hotel not found'] });
    removeFile(rows[0].image_path);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (e) { next(e); }
};
