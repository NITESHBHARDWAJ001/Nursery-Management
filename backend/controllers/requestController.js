const Request = require('../models/Request');

// @desc    Create new request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const {
      requestType,
      title,
      description,
      preferredDate,
      location,
      contactNumber
    } = req.body;

    const requestData = {
      user: req.user._id,
      requestType,
      title,
      description,
      preferredDate,
      location,
      contactNumber: contactNumber || req.user.phone
    };

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      const imagePaths = req.files.map(file => `/uploads/requests/${file.filename}`);
      requestData.images = imagePaths;
    }

    const request = await Request.create(requestData);

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Request submitted successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Create request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating request',
      error: error.message
    });
  }
};

// @desc    Get all requests (Admin)
// @route   GET /api/requests
// @access  Private/Admin
exports.getAllRequests = async (req, res) => {
  try {
    const {
      status,
      requestType,
      priority,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (status) query.status = status;
    if (requestType) query.requestType = requestType;
    if (priority) query.priority = priority;

    const skip = (page - 1) * limit;

    const requests = await Request.find(query)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Request.countDocuments(query);

    res.json({
      success: true,
      data: requests,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// @desc    Get user's requests
// @route   GET /api/requests/user
// @access  Private
exports.getUserRequests = async (req, res) => {
  try {
    const requests = await Request.find({ user: req.user._id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Get user requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests',
      error: error.message
    });
  }
};

// @desc    Update request status
// @route   PUT /api/requests/:id/status
// @access  Private/Admin
exports.updateRequestStatus = async (req, res) => {
  try {
    const {
      status,
      priority,
      estimatedCost,
      adminNotes
    } = req.body;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    if (status) {
      request.status = status;
      if (status === 'approved' || status === 'rejected') {
        request.responseDate = new Date();
      }
      if (status === 'completed') {
        request.completionDate = new Date();
      }
    }

    if (priority) request.priority = priority;
    if (estimatedCost !== undefined) request.estimatedCost = estimatedCost;
    if (adminNotes) request.adminNotes = adminNotes;

    await request.save();

    const populatedRequest = await Request.findById(request._id)
      .populate('user', 'name email phone');

    res.json({
      success: true,
      message: 'Request updated successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Update request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating request',
      error: error.message
    });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private/Admin
exports.deleteRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found'
      });
    }

    await request.deleteOne();

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Delete request error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting request',
      error: error.message
    });
  }
};
