const router = require('express').Router();
const upload = require('../middleware/upload');
const c = require('../controllers/hotelController');

router.get('/', c.getHotels);
router.get('/:id', c.getHotel);
router.post('/', upload.single('image'), c.createHotel); 
router.put('/:id', upload.single('image'), c.updateHotel);
router.delete('/:id', c.deleteHotel);

module.exports = router;
