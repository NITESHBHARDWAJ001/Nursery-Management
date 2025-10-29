const { createObjectCsvWriter } = require('csv-writer');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');
const StockTransaction = require('../models/StockTransaction');
const Plant = require('../models/Plant');
// ...existing code...

// @desc    Export all shop sales in CSV format
// @route   GET /api/stock/export-shop-sales?format=csv
// @access  Private/Admin
exports.exportShopSales = async (req, res) => {
  try {
    const { format = 'csv', date, from, to } = req.query;
    let query = { type: 'sold' };
    if (from || to) {
      let start = from ? new Date(from) : new Date();
      start.setHours(0, 0, 0, 0);
      let end = to ? new Date(to) : new Date();
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    } else if (date) {
      let start = new Date(date);
      start.setHours(0, 0, 0, 0);
      let end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.date = { $gte: start, $lte: end };
    }
    const sales = await StockTransaction.find(query).populate('plant', 'name category');
    if (format === 'csv') {
      const data = sales.map(sale => ({
        date: sale.date.toLocaleDateString('en-IN'),
        plantName: sale.plant?.name || '-',
        category: sale.plant?.category || '-',
        quantity: sale.quantityChanged < 0 ? -sale.quantityChanged : sale.quantityChanged,
        salePrice: sale.costPerUnit,
        total: sale.totalCost,
        description: sale.notes || ''
      }));
      const fileName = `shop_sales_${Date.now()}.csv`;
      const filePath = path.join(__dirname, '..', 'public', 'reports', fileName);
      const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
          { id: 'date', title: 'Date' },
          { id: 'plantName', title: 'Plant Name' },
          { id: 'category', title: 'Category' },
          { id: 'quantity', title: 'Quantity' },
          { id: 'salePrice', title: 'Sale Price (₹)' },
          { id: 'total', title: 'Total (₹)' },
          { id: 'description', title: 'Description' }
        ]
      });
      await csvWriter.writeRecords(data);
      return res.json({ success: true, url: `/reports/${fileName}` });
    } else if (format === 'pdf') {
      const fileName = `shop_sales_${Date.now()}.pdf`;
      const reportsDir = path.join(__dirname, '..', 'public', 'reports');
      
      // Ensure reports directory exists
      if (!fs.existsSync(reportsDir)) {
        fs.mkdirSync(reportsDir, { recursive: true });
      }
      
      const filePath = path.join(reportsDir, fileName);
      
      // Create PDF with Promise
      await new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 30, size: 'A4' });
        const stream = fs.createWriteStream(filePath);
        
        stream.on('error', reject);
        stream.on('finish', resolve);
        
        doc.pipe(stream);
        
        doc.fontSize(18).text('Shop Sales Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12);
        
        // Table header
        doc.text('Date', 30, doc.y, { continued: true });
        doc.text('Plant Name', 100, doc.y, { continued: true });
        doc.text('Category', 200, doc.y, { continued: true });
        doc.text('Qty', 280, doc.y, { continued: true });
        doc.text('Sale Price', 320, doc.y, { continued: true });
        doc.text('Total', 400, doc.y, { continued: true });
        doc.text('Description', 470, doc.y);
        doc.moveDown(0.5);
        
        sales.forEach(sale => {
          doc.text(sale.date.toLocaleDateString('en-IN'), 30, doc.y, { continued: true });
          doc.text(sale.plant?.name || '-', 100, doc.y, { continued: true });
          doc.text(sale.plant?.category || '-', 200, doc.y, { continued: true });
          doc.text(sale.quantityChanged < 0 ? -sale.quantityChanged : sale.quantityChanged, 280, doc.y, { continued: true });
          doc.text(sale.costPerUnit, 320, doc.y, { continued: true });
          doc.text(sale.totalCost, 400, doc.y, { continued: true });
          doc.text(sale.notes || '', 470, doc.y);
          doc.moveDown(0.2);
        });
        
        doc.end();
      });
      
      return res.json({ success: true, url: `/reports/${fileName}` });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid format' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
// @desc    Record a shop sale and update stock
// @route   POST /api/stock/shop-sale
// @access  Private/Admin
exports.recordShopSale = async (req, res) => {
  try {
    const { plantId, salePrice, quantity, description, date } = req.body;
    if (!plantId || !salePrice || !quantity) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    const plant = await Plant.findById(plantId);
    if (!plant) {
      return res.status(404).json({ success: false, message: 'Plant not found' });
    }
    if (plant.quantityAvailable < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock available' });
    }
    const previousQuantity = plant.quantityAvailable;
    plant.quantityAvailable -= Number(quantity);
    await plant.save();
    const transaction = await StockTransaction.create({
      plant: plantId,
      type: 'sold',
      quantityChanged: -Number(quantity),
      previousQuantity,
      newQuantity: plant.quantityAvailable,
      costPerUnit: salePrice,
      totalCost: salePrice * quantity,
      notes: description,
      date: date ? new Date(date) : new Date(),
      performedBy: req.user._id
    });
    res.json({ success: true, message: 'Sale recorded', data: transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get shop sales for a specific date
// @route   GET /api/stock/shop-sale?date=YYYY-MM-DD
// @access  Private/Admin
exports.getShopSales = async (req, res) => {
  try {
    const { date } = req.query;
    let start, end;
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }
    const sales = await StockTransaction.find({
      type: 'sold',
      date: { $gte: start, $lte: end }
    })
      .populate('plant', 'name category')
      .sort({ date: -1 });
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update stock manually
// @route   POST /api/stock/update
// @access  Private/Admin
exports.updateStock = async (req, res) => {
  try {
    const {
      plantId,
      type,
      quantityChanged,
      costPerUnit,
      notes
    } = req.body;

    const plant = await Plant.findById(plantId);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const previousQuantity = plant.quantityAvailable;
    let newQuantity;

    // Calculate new quantity based on transaction type
    switch (type) {
      case 'purchased':
        newQuantity = previousQuantity + Math.abs(quantityChanged);
        break;
      case 'adjustment':
        newQuantity = previousQuantity + quantityChanged;
        break;
      case 'damaged':
      case 'returned':
        newQuantity = previousQuantity - Math.abs(quantityChanged);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid transaction type'
        });
    }

    // Ensure quantity doesn't go below 0
    if (newQuantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock quantity cannot be negative'
      });
    }

    // Update plant quantity
    plant.quantityAvailable = newQuantity;
    await plant.save();

    // Create transaction record
    const transaction = await StockTransaction.create({
      plant: plantId,
      type,
      quantityChanged: newQuantity - previousQuantity,
      previousQuantity,
      newQuantity,
      costPerUnit: costPerUnit || 0,
      totalCost: (costPerUnit || 0) * Math.abs(quantityChanged),
      notes,
      performedBy: req.user._id
    });

    const populatedTransaction = await StockTransaction.findById(transaction._id)
      .populate('plant', 'name category imageUrl')
      .populate('performedBy', 'name email');

    res.json({
      success: true,
      message: 'Stock updated successfully',
      data: {
        transaction: populatedTransaction,
        updatedPlant: plant
      }
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating stock',
      error: error.message
    });
  }
};

// @desc    Get all stock transactions
// @route   GET /api/stock/transactions
// @access  Private/Admin
exports.getStockTransactions = async (req, res) => {
  try {
    const {
      type,
      plantId,
      startDate,
      endDate,
      page = 1,
      limit = 50
    } = req.query;

    let query = {};

    if (type) query.type = type;
    if (plantId) query.plant = plantId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const transactions = await StockTransaction.find(query)
      .populate('plant', 'name category imageUrl')
      .populate('performedBy', 'name email')
      .sort({ date: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await StockTransaction.countDocuments(query);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching transactions',
      error: error.message
    });
  }
};

// @desc    Get stock history for specific plant
// @route   GET /api/stock/history/:plantId
// @access  Private/Admin
exports.getPlantStockHistory = async (req, res) => {
  try {
    const { plantId } = req.params;

    const plant = await Plant.findById(plantId);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: 'Plant not found'
      });
    }

    const transactions = await StockTransaction.find({ plant: plantId })
      .populate('performedBy', 'name email')
      .sort({ date: -1 });

    res.json({
      success: true,
      data: {
        plant: {
          _id: plant._id,
          name: plant.name,
          currentStock: plant.quantityAvailable
        },
        transactions
      }
    });
  } catch (error) {
    console.error('Get plant stock history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stock history',
      error: error.message
    });
  }
};

// @desc    Generate Purchase Order PDF
// @route   POST /api/stock/purchase-order
// @access  Private/Admin
exports.generatePurchaseOrder = async (req, res) => {
  try {
    // Get all low stock plants
    const lowStockPlants = await Plant.find({
      $expr: { $lte: ['$quantityAvailable', '$lowStockThreshold'] }
    }).sort({ quantityAvailable: 1 });

    if (lowStockPlants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No plants below stock threshold. No purchase order needed.'
      });
    }

    // Create purchase orders directory if it doesn't exist
    const poDir = path.join(__dirname, '..', 'public', 'purchase-orders');
    if (!fs.existsSync(poDir)) {
      fs.mkdirSync(poDir, { recursive: true });
    }

    const poNumber = `PO-${Date.now()}`;
    const filename = `purchase_order_${poNumber}.pdf`;
    const filepath = path.join(poDir, filename);

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ===== HEADER =====
    doc.rect(0, 0, doc.page.width, 120).fill('#15803d');
    
    doc.fontSize(28)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text('🌿 Green Haven Nursery', 50, 30, { align: 'center' })
      .moveDown(0.3);

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#FFFFFF')
      .text('Purchase Order for Stock Replenishment', { align: 'center' })
      .text('📍 123 Garden Street, Green Valley, GH 12345', { align: 'center' })
      .text('📞 +91-1234567890 | ✉️ procurement@greenhaven.com', { align: 'center' });

    // ===== PO INFO =====
    doc.fontSize(20)
      .fillColor('#15803d')
      .font('Helvetica-Bold')
      .text('PURCHASE ORDER', 50, 140);

    const infoTop = 140;
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .text('PO Details:', 50, infoTop + 40)
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#000000')
      .text(`PO Number: ${poNumber}`, 50, infoTop + 60)
      .text(`Date: ${new Date().toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}`, 50, infoTop + 75)
      .text(`Total Items: ${lowStockPlants.length}`, 50, infoTop + 90);

    // Supplier box
    doc.roundedRect(320, infoTop + 40, 230, 80, 5)
       .strokeColor('#15803d')
       .lineWidth(1)
       .stroke();

    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#15803d')
      .text('Supplier:', 330, infoTop + 50)
      .font('Helvetica')
      .fillColor('#000000')
      .fontSize(10)
      .text('To be assigned by Procurement Team', 330, infoTop + 68)
      .text('Please assign supplier before processing', 330, infoTop + 83, { width: 210 })
      .text('Contact: procurement@greenhaven.com', 330, infoTop + 98);

    // ===== ITEMS TABLE =====
    const tableTop = 290;
    
    // Table header background
    doc.rect(50, tableTop, 500, 30).fill('#15803d');

    // Table headers
    doc.fontSize(11)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text('Plant Name', 60, tableTop + 10, { width: 180 })
      .text('Current', 250, tableTop + 10, { width: 60, align: 'center' })
      .text('Threshold', 320, tableTop + 10, { width: 60, align: 'center' })
      .text('Order Qty', 390, tableTop + 10, { width: 70, align: 'center' })
      .text('Est. Cost', 470, tableTop + 10, { width: 70, align: 'right' });

    // Items
    let yPosition = tableTop + 40;
    let totalCost = 0;

    lowStockPlants.forEach((plant, index) => {
      // Calculate order quantity (to reach threshold + 20% buffer)
      const orderQty = Math.ceil((plant.lowStockThreshold * 1.2) - plant.quantityAvailable);
      const estimatedCost = plant.price * orderQty * 0.6; // Assume purchase cost is 60% of selling price
      totalCost += estimatedCost;

      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 500, 25).fill('#f9fafb').stroke();
      }

      // Check if we need a new page
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.fontSize(10)
        .fillColor('#000000')
        .font('Helvetica')
        .text(plant.name, 60, yPosition, { width: 180, ellipsis: true })
        .text(plant.quantityAvailable.toString(), 250, yPosition, { width: 60, align: 'center' })
        .text(plant.lowStockThreshold.toString(), 320, yPosition, { width: 60, align: 'center' })
        .font('Helvetica-Bold')
        .text(orderQty.toString(), 390, yPosition, { width: 70, align: 'center' })
        .text(`₹${estimatedCost.toFixed(2)}`, 470, yPosition, { width: 70, align: 'right' });

      yPosition += 25;
    });

    // Table border
    doc.rect(50, tableTop, 500, yPosition - tableTop).strokeColor('#cccccc').stroke();

    yPosition += 15;

    // ===== TOTAL SECTION =====
    doc.fontSize(10)
      .font('Helvetica')
      .fillColor('#000000')
      .text('Total Items:', 370, yPosition, { width: 90, align: 'right' })
      .text(lowStockPlants.length.toString(), 460, yPosition, { width: 80, align: 'right' });

    yPosition += 20;

    doc.text('Estimated Total Cost:', 370, yPosition, { width: 90, align: 'right' })
      .text(`₹${totalCost.toFixed(2)}`, 460, yPosition, { width: 80, align: 'right' });

    yPosition += 25;

    // Grand Total background
    doc.rect(360, yPosition - 5, 190, 30).fill('#15803d');

    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('TOTAL AMOUNT:', 370, yPosition + 5, { width: 90, align: 'right' })
      .text(`₹${totalCost.toFixed(2)}`, 460, yPosition + 5, { width: 80, align: 'right' });

    // ===== NOTES SECTION =====
    yPosition += 50;

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#15803d')
      .text('Important Notes:', 50, yPosition);

    doc.fontSize(9)
      .font('Helvetica')
      .fillColor('#000000')
      .text('• Order quantities calculated to reach threshold + 20% safety buffer', 50, yPosition + 20)
      .text('• Estimated costs based on 60% of current selling price', 50, yPosition + 35)
      .text('• Please verify supplier prices before placing final order', 50, yPosition + 50)
      .text('• Expected delivery time: 7-10 business days', 50, yPosition + 65)
      .text('• Contact procurement team for supplier assignment and approval', 50, yPosition + 80);

    // ===== APPROVAL SECTION =====
    yPosition += 120;

    if (yPosition > 650) {
      doc.addPage();
      yPosition = 50;
    }

    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#15803d')
      .text('Approval & Authorization:', 50, yPosition);

    // Approval boxes
    const boxY = yPosition + 30;
    
    doc.rect(50, boxY, 200, 80).stroke();
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Prepared By:', 60, boxY + 10)
      .font('Helvetica')
      .fontSize(9)
      .text('Name: ___________________', 60, boxY + 35)
      .text('Date: ___________________', 60, boxY + 55);

    doc.rect(300, boxY, 200, 80).stroke();
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .fillColor('#000000')
      .text('Approved By:', 310, boxY + 10)
      .font('Helvetica')
      .fontSize(9)
      .text('Name: ___________________', 310, boxY + 35)
      .text('Date: ___________________', 310, boxY + 55);

    // ===== FOOTER =====
    const footerTop = doc.page.height - 80;
    
    doc.fontSize(9)
      .fillColor('#666666')
      .font('Helvetica-Oblique')
      .text('This is a system-generated purchase order based on current stock levels.', 50, footerTop, { 
        align: 'center', 
        width: 500 
      });

    doc.fontSize(8)
      .fillColor('#999999')
      .font('Helvetica')
      .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 50, footerTop + 20, { 
        align: 'center', 
        width: 500 
      });

    doc.end();

    // Wait for PDF to be written
    stream.on('finish', () => {
      res.json({
        success: true,
        message: 'Purchase order generated successfully',
        data: {
          poNumber,
          filename,
          downloadUrl: `/purchase-orders/${filename}`,
          itemCount: lowStockPlants.length,
          totalCost: totalCost.toFixed(2)
        }
      });
    });

    stream.on('error', (error) => {
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating purchase order',
        error: error.message
      });
    });
  } catch (error) {
    console.error('Generate purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating purchase order',
      error: error.message
    });
  }
};

// @desc    Export Purchase Order to Excel/CSV
// @route   POST /api/stock/export-purchase-order
// @access  Private/Admin
exports.exportPurchaseOrder = async (req, res) => {
  try {
    // Get all low stock plants
    const lowStockPlants = await Plant.find({
      $expr: { $lte: ['$quantityAvailable', '$lowStockThreshold'] }
    }).sort({ quantityAvailable: 1 });

    if (lowStockPlants.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No plants below stock threshold. No purchase order needed.'
      });
    }

    // Prepare data for CSV
    const data = lowStockPlants.map(plant => {
      const orderQty = Math.ceil((plant.lowStockThreshold * 1.2) - plant.quantityAvailable);
      const estimatedCost = plant.price * orderQty * 0.6;

      return {
        date: new Date().toLocaleDateString('en-IN'),
        plantName: plant.name,
        category: plant.category,
        currentStock: plant.quantityAvailable,
        threshold: plant.lowStockThreshold,
        orderQuantity: orderQty,
        unitPrice: (plant.price * 0.6).toFixed(2),
        estimatedCost: estimatedCost.toFixed(2)
      };
    });

    // Calculate totals
    const totalQuantity = data.reduce((sum, item) => sum + item.orderQuantity, 0);
    const totalCost = data.reduce((sum, item) => sum + parseFloat(item.estimatedCost), 0);

    // Add totals row
    data.push({
      date: '',
      plantName: 'TOTAL',
      category: '',
      currentStock: '',
      threshold: '',
      orderQuantity: totalQuantity,
      unitPrice: '',
      estimatedCost: totalCost.toFixed(2)
    });

    // Create purchase orders directory
    const poDir = path.join(__dirname, '..', 'public', 'purchase-orders');
    if (!fs.existsSync(poDir)) {
      fs.mkdirSync(poDir, { recursive: true });
    }

    const poNumber = `PO-${Date.now()}`;
    const filename = `purchase_order_${poNumber}.csv`;
    const filepath = path.join(poDir, filename);

    // Create CSV writer
    const csvWriter = createObjectCsvWriter({
      path: filepath,
      header: [
        { id: 'date', title: 'Date' },
        { id: 'plantName', title: 'Plant Name' },
        { id: 'category', title: 'Category' },
        { id: 'currentStock', title: 'Current Stock' },
        { id: 'threshold', title: 'Threshold' },
        { id: 'orderQuantity', title: 'Order Quantity' },
        { id: 'unitPrice', title: 'Unit Price (₹)' },
        { id: 'estimatedCost', title: 'Estimated Cost (₹)' }
      ]
    });

    await csvWriter.writeRecords(data);

    res.json({
      success: true,
      message: 'Purchase order exported successfully',
      data: {
        poNumber,
        filename,
        downloadUrl: `/purchase-orders/${filename}`,
        itemCount: lowStockPlants.length,
        totalCost: totalCost.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Export purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting purchase order',
      error: error.message
    });
  }
};
