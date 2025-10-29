const express = require('express');
const router = express.Router();
const {
  getAllPlants,
  getPlantById,
  createPlant,
  updatePlant,
  deletePlant,
  searchPlants
} = require('../controllers/plantController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getAllPlants);
router.get('/search', searchPlants);
router.get('/:id', getPlantById);

// Admin only routes
router.post('/', protect, adminOnly, upload.single('image'), createPlant);
router.put('/:id', protect, adminOnly, upload.single('image'), updatePlant);
router.delete('/:id', protect, adminOnly, deletePlant);

module.exports = router;
