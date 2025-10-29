const Report = require('../models/Report');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const User = require('../models/User');
const StockTransaction = require('../models/StockTransaction');
const { createObjectCsvWriter } = require('csv-writer');
const path = require('path');
const fs = require('fs');

// @desc    Get monthly report
// @route   GET /api/reports/monthly
// @access  Private/Admin
exports.getMonthlyReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    const report = await Report.findOne({ month, year })
      .populate('forecastedDemand.plant', 'name imageUrl')
      .populate('topSellingPlants.plant', 'name imageUrl')
      .populate('lowStockItems.plant', 'name imageUrl');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found for the specified period'
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    console.error('Get monthly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// @desc    Get all reports
// @route   GET /api/reports/all
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json({
      success: true,
      data: reports,
      count: reports.length
    });
  } catch (error) {
    console.error('Get all reports error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// @desc    Generate monthly report manually
// @route   POST /api/reports/generate
// @access  Private/Admin
exports.generateReport = async (req, res) => {
  try {
    const { month, year } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required'
      });
    }

    // Check if report already exists
    const existingReport = await Report.findOne({ month, year });
    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'Report already exists for this period'
      });
    }

    // Calculate date range
    const monthIndex = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December']
                        .indexOf(month);
    
    const startDate = new Date(year, monthIndex, 1);
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    // Get orders for the period
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
      orderStatus: { $ne: 'cancelled' }
    }).populate('items.plant');

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Get purchases (stock transactions)
    const purchases = await StockTransaction.find({
      type: 'purchased',
      date: { $gte: startDate, $lte: endDate }
    });

    const totalPurchases = purchases.reduce((sum, tx) => sum + tx.totalCost, 0);

    // Calculate profit
    const profit = totalSales - totalPurchases;

    // Get top selling plants
    const plantSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const plantId = item.plant._id.toString();
        if (!plantSales[plantId]) {
          plantSales[plantId] = {
            plant: item.plant._id,
            plantName: item.plant.name,
            quantitySold: 0,
            revenue: 0
          };
        }
        plantSales[plantId].quantitySold += item.quantity;
        plantSales[plantId].revenue += item.subtotal;
      });
    });

    const topSellingPlants = Object.values(plantSales)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // Get low stock items
    const lowStockPlants = await Plant.find({
      $expr: { $lte: ['$quantityAvailable', '$lowStockThreshold'] }
    }).limit(20);

    const lowStockItems = lowStockPlants.map(plant => ({
      plant: plant._id,
      plantName: plant.name,
      currentStock: plant.quantityAvailable
    }));

    // Simple forecasting (average of last 3 months)
    const forecastedDemand = await generateForecast(topSellingPlants);

    // Count new customers
    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startDate, $lte: endDate }
    });

    // Create report
    const report = await Report.create({
      month,
      year,
      totalSales,
      totalOrders,
      totalPurchases,
      totalExpenses: totalPurchases,
      profit,
      forecastedDemand,
      topSellingPlants,
      lowStockItems,
      newCustomers
    });

    res.status(201).json({
      success: true,
      message: 'Report generated successfully',
      data: report
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating report',
      error: error.message
    });
  }
};

// Helper function for forecasting
async function generateForecast(topSellingPlants) {
  return topSellingPlants.slice(0, 5).map(item => ({
    plant: item.plant,
    plantName: item.plantName,
    predictedQuantity: Math.ceil(item.quantitySold * 1.1) // 10% increase prediction
  }));
}

// @desc    Export data to CSV
// @route   GET /api/reports/export
// @access  Private/Admin
exports.exportData = async (req, res) => {
  try {
    const { type, startDate, endDate } = req.query;

    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'orders':
        const orders = await Order.find({
          orderDate: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).populate('user', 'name email');

        data = orders.map(order => ({
          orderId: order.orderId,
          customerName: order.user.name,
          customerEmail: order.user.email,
          totalAmount: order.totalAmount,
          orderStatus: order.orderStatus,
          orderDate: order.orderDate.toISOString().split('T')[0]
        }));

        filename = `orders_${Date.now()}.csv`;
        headers = [
          { id: 'orderId', title: 'Order ID' },
          { id: 'customerName', title: 'Customer Name' },
          { id: 'customerEmail', title: 'Customer Email' },
          { id: 'totalAmount', title: 'Total Amount' },
          { id: 'orderStatus', title: 'Status' },
          { id: 'orderDate', title: 'Order Date' }
        ];
        break;

      case 'inventory':
        const plants = await Plant.find();

        data = plants.map(plant => ({
          name: plant.name,
          category: plant.category,
          price: plant.price,
          quantity: plant.quantityAvailable,
          soldCount: plant.soldCount
        }));

        filename = `inventory_${Date.now()}.csv`;
        headers = [
          { id: 'name', title: 'Plant Name' },
          { id: 'category', title: 'Category' },
          { id: 'price', title: 'Price' },
          { id: 'quantity', title: 'Available Quantity' },
          { id: 'soldCount', title: 'Total Sold' }
        ];
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Create CSV file
    const filepath = path.join(__dirname, '..', 'public', 'reports', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: headers
    });

    await csvWriter.writeRecords(data);

    res.json({
      success: true,
      message: 'Data exported successfully',
      data: {
        filename,
        downloadUrl: `/reports/${filename}`,
        recordCount: data.length
      }
    });
  } catch (error) {
    console.error('Export data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting data',
      error: error.message
    });
  }
};

// @desc    Get demand forecast
// @route   GET /api/reports/forecast
// @access  Private/Admin
exports.getForecast = async (req, res) => {
  try {
    // Get last 3 months of data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const orders = await Order.find({
      orderDate: { $gte: threeMonthsAgo },
      orderStatus: { $ne: 'cancelled' }
    }).populate('items.plant');

    // Aggregate plant sales
    const plantSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const plantId = item.plant._id.toString();
        if (!plantSales[plantId]) {
          plantSales[plantId] = {
            plantId: item.plant._id,
            plantName: item.plant.name,
            totalSold: 0,
            monthlySales: []
          };
        }
        plantSales[plantId].totalSold += item.quantity;
      });
    });

    // Calculate forecast (simple moving average + 15% growth)
    const forecast = Object.values(plantSales).map(item => ({
      plant: item.plantId,
      plantName: item.plantName,
      historicalSales: item.totalSold,
      predictedDemand: Math.ceil(item.totalSold / 3 * 1.15) // Monthly average + 15%
    })).sort((a, b) => b.predictedDemand - a.predictedDemand).slice(0, 20);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    console.error('Get forecast error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating forecast',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/reports/dashboard
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Today's stats
    const todayOrders = await Order.countDocuments({
      orderDate: { $gte: today }
    });

    const todaySales = await Order.aggregate([
      { $match: { orderDate: { $gte: today }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // This month stats
    const monthOrders = await Order.countDocuments({
      orderDate: { $gte: thisMonth }
    });

    const monthSales = await Order.aggregate([
      { $match: { orderDate: { $gte: thisMonth }, orderStatus: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Last month stats for comparison
    const lastMonthSales = await Order.aggregate([
      {
        $match: {
          orderDate: { $gte: lastMonth, $lt: thisMonth },
          orderStatus: { $ne: 'cancelled' }
        }
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    // Low stock alerts
    const lowStockCount = await Plant.countDocuments({
      $expr: { $lte: ['$quantityAvailable', '$lowStockThreshold'] }
    });

    // Total customers
    const totalCustomers = await User.countDocuments({ role: 'user' });

    // Total plants
    const totalPlants = await Plant.countDocuments();

    // Pending orders
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });

    res.json({
      success: true,
      data: {
        today: {
          sales: todaySales[0]?.total || 0,
          orders: todayOrders
        },
        thisMonth: {
          sales: monthSales[0]?.total || 0,
          orders: monthOrders
        },
        lastMonth: {
          sales: lastMonthSales[0]?.total || 0
        },
        lowStockAlerts: lowStockCount,
        totalCustomers,
        totalPlants,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};
