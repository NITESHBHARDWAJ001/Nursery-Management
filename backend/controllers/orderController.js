const Order = require('../models/Order');
const Plant = require('../models/Plant');
const StockTransaction = require('../models/StockTransaction');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res) => {
  try {
    const {
      items,
      deliveryAddress,
      contactNumber,
      orderType,
      notes
    } = req.body;

    // Validate items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const plant = await Plant.findById(item.plant);

      if (!plant) {
        return res.status(404).json({
          success: false,
          message: `Plant with ID ${item.plant} not found`
        });
      }

      if (plant.quantityAvailable < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${plant.name}. Available: ${plant.quantityAvailable}`
        });
      }

      const subtotal = plant.price * item.quantity;
      totalAmount += subtotal;

      orderItems.push({
        plant: plant._id,
        name: plant.name,
        quantity: item.quantity,
        price: plant.price,
        subtotal
      });

      // Update plant stock and sold count
      plant.quantityAvailable -= item.quantity;
      plant.soldCount += item.quantity;
      await plant.save();

      // Create stock transaction
      await StockTransaction.create({
        plant: plant._id,
        type: 'sold',
        quantityChanged: -item.quantity,
        previousQuantity: plant.quantityAvailable + item.quantity,
        newQuantity: plant.quantityAvailable,
        costPerUnit: plant.price,
        totalCost: subtotal,
        performedBy: req.user._id,
        notes: `Order placement`
      });
    }

    // Set expected delivery date (7 days from now)
    const expectedDeliveryDate = new Date();
    expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 7);

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      deliveryAddress: deliveryAddress || req.user.address,
      contactNumber: contactNumber || req.user.phone,
      orderType: orderType || 'onlineBooking',
      notes,
      expectedDeliveryDate
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('user', 'name email phone')
      .populate('items.plant');

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
  try {
    const {
      status,
      orderType,
      startDate,
      endDate,
      page = 1,
      limit = 20
    } = req.query;

    let query = {};

    if (status) query.orderStatus = status;
    if (orderType) query.orderType = orderType;

    if (startDate || endDate) {
      query.orderDate = {};
      if (startDate) query.orderDate.$gte = new Date(startDate);
      if (endDate) query.orderDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.plant', 'name imageUrl')
      .sort({ orderDate: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get user's orders
// @route   GET /api/orders/user
// @access  Private
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.plant', 'name imageUrl category')
      .sort({ orderDate: -1 });

    res.json({
      success: true,
      data: orders,
      count: orders.length
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone address')
      .populate('items.plant');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus, deliveryDate } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (deliveryDate) order.deliveryDate = deliveryDate;

    if (orderStatus === 'delivered' && !order.deliveryDate) {
      order.deliveryDate = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    await order.deleteOne();

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting order',
      error: error.message
    });
  }
};
