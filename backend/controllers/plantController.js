const Plant = require('../models/Plant');
const path = require('path');

// @desc    Get all plants with filters
// @route   GET /api/plants
// @access  Public
exports.getAllPlants = async (req, res) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      inStock,
      sortBy,
      page = 1,
      limit = 12
    } = req.query;

    // Build query
    let query = {};

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (inStock === 'true') {
      query.quantityAvailable = { $gt: 0 };
      query.isAvailable = true;
    }

    // Sorting
    let sortOptions = {};
    switch (sortBy) {
      case 'price-low':
        sortOptions.price = 1;
        break;
      case 'price-high':
        sortOptions.price = -1;
        break;
      case 'popular':
        sortOptions.soldCount = -1;
        break;
      case 'newest':
        sortOptions.dateAdded = -1;
        break;
      default:
        sortOptions.dateAdded = -1;
    }

    // Pagination
    const skip = (page - 1) * limit;

    const plants = await Plant.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip(skip);

    const total = await Plant.countDocuments(query);

    res.json({
      success: true,
      data: plants,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plants',
      error: error.message
    });
  }
};

// @desc    Get single plant by ID
// @route   GET /api/plants/:id
// @access  Public
exports.getPlantById = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    res.json({
      success: true,
      data: plant
    });
  } catch (error) {
    console.error('Get plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching plant',
      error: error.message
    });
  }
};

// @desc    Create new plant
// @route   POST /api/plants
// @access  Private/Admin
exports.createPlant = async (req, res) => {
  try {
    const plantData = { ...req.body };

    // Handle uploaded image (single file)
    if (req.file) {
      const imageUrl = `/uploads/plants/${req.file.filename}`;
      plantData.imageUrl = imageUrl;
    }

    // Parse features array if sent as string
    if (typeof plantData.features === 'string') {
      try {
        plantData.features = JSON.parse(plantData.features);
      } catch (e) {
        // If not JSON, split by newline
        plantData.features = plantData.features.split('\n').filter(f => f.trim());
      }
    }

    const plant = await Plant.create(plantData);

    res.status(201).json({
      success: true,
      message: 'Plant created successfully',
      data: plant
    });
  } catch (error) {
    console.error('Create plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating plant',
      error: error.message
    });
  }
};

// @desc    Update plant
// @route   PUT /api/plants/:id
// @access  Private/Admin
exports.updatePlant = async (req, res) => {
  try {
    let plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const updateData = { ...req.body };

    // Handle new uploaded image (single file)
    if (req.file) {
      const imageUrl = `/uploads/plants/${req.file.filename}`;
      updateData.imageUrl = imageUrl;
    }

    // Parse features array if sent as string
    if (typeof updateData.features === 'string') {
      try {
        updateData.features = JSON.parse(updateData.features);
      } catch (e) {
        // If not JSON, split by newline
        updateData.features = updateData.features.split('\n').filter(f => f.trim());
      }
    }

    plant = await Plant.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    res.json({
      success: true,
      message: 'Plant updated successfully',
      data: plant
    });
  } catch (error) {
    console.error('Update plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plant',
      error: error.message
    });
  }
};

// @desc    Delete plant
// @route   DELETE /api/plants/:id
// @access  Private/Admin
exports.deletePlant = async (req, res) => {
  try {
    const plant = await Plant.findById(req.params.id);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    await plant.deleteOne();

    res.json({
      success: true,
      message: 'Plant deleted successfully'
    });
  } catch (error) {
    console.error('Delete plant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plant',
      error: error.message
    });
  }
};

// @desc    Search plants
// @route   GET /api/plants/search
// @access  Public
exports.searchPlants = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const plants = await Plant.find({
      $text: { $search: q }
    }).limit(20);

    res.json({
      success: true,
      data: plants,
      count: plants.length
    });
  } catch (error) {
    console.error('Search plants error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching plants',
      error: error.message
    });
  }
};
