const Report = require('../models/Report');
const Order = require('../models/Order');
const Plant = require('../models/Plant');
const StockTransaction = require('../models/StockTransaction');
const User = require('../models/User');

// Generate monthly report automatically
exports.generateMonthlyReport = async () => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const month = lastMonth.toLocaleString('default', { month: 'long' });
    const year = lastMonth.getFullYear();

    // Check if report already exists
    const existingReport = await Report.findOne({ month, year });
    if (existingReport) {
      console.log(`Report for ${month} ${year} already exists`);
      return existingReport;
    }

    const startDate = new Date(year, lastMonth.getMonth(), 1);
    const endDate = new Date(year, lastMonth.getMonth() + 1, 0, 23, 59, 59);

    // Get orders for the period
    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
      orderStatus: { $ne: 'cancelled' }
    }).populate('items.plant');

    // Calculate total sales
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;

    // Get purchases
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
        if (!item.plant) return;
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

    // Simple forecasting
    const forecastedDemand = topSellingPlants.slice(0, 5).map(item => ({
      plant: item.plant,
      plantName: item.plantName,
      predictedQuantity: Math.ceil(item.quantitySold * 1.1)
    }));

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

    console.log(`✅ Monthly report generated for ${month} ${year}`);
    return report;
  } catch (error) {
    console.error('Error generating monthly report:', error);
    throw error;
  }
};
