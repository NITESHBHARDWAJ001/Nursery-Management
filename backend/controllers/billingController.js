const Order = require('../models/Order');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Twilio client - only initialize if valid credentials are provided
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && 
                      process.env.TWILIO_AUTH_TOKEN &&
                      process.env.TWILIO_ACCOUNT_SID.startsWith('AC'))
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// @desc    Generate PDF bill
// @route   POST /api/billing/generate
// @access  Private/Admin
exports.generateBill = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone address')
      .populate('items.plant', 'name category');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Create bills directory if it doesn't exist
    const billsDir = path.join(__dirname, '..', 'public', 'bills');
    if (!fs.existsSync(billsDir)) {
      fs.mkdirSync(billsDir, { recursive: true });
    }

    const filename = `bill_${order.orderId || order._id}_${Date.now()}.pdf`;
    const filepath = path.join(billsDir, filename);

    // Create PDF with professional formatting
    const doc = new PDFDocument({ 
      margin: 50,
      size: 'A4'
    });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // ===== HEADER SECTION =====
    doc.rect(0, 0, doc.page.width, 120).fill('#15803d');
    
    doc.fontSize(28)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text('🌿 Green Haven Nursery', 50, 30, { align: 'center' })
      .moveDown(0.3);

    doc.fontSize(11)
      .font('Helvetica')
      .fillColor('#FFFFFF')
      .text('Your Trusted Partner in Plant Care', { align: 'center' })
      .text('📍 123 Garden Street, Green Valley, GH 12345', { align: 'center' })
      .text('📞 +91-1234567890 | ✉️ contact@greenhaven.com', { align: 'center' });

    doc.moveDown(2);

    // ===== INVOICE TITLE =====
    doc.fontSize(20)
      .fillColor('#15803d')
      .font('Helvetica-Bold')
      .text('TAX INVOICE', 50, 140);

    // ===== INVOICE INFO BOX =====
    const infoBoxTop = 140;
    doc.fontSize(10)
      .fillColor('#000000')
      .font('Helvetica');

    // Left side - Invoice details
    doc.fontSize(11)
      .font('Helvetica-Bold')
      .text('Invoice Details:', 50, infoBoxTop + 40)
      .font('Helvetica')
      .fontSize(10)
      .text(`Invoice No: ${order.orderId || order._id.toString().slice(-8).toUpperCase()}`, 50, infoBoxTop + 60)
      .text(`Invoice Date: ${new Date(order.orderDate).toLocaleDateString('en-IN', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      })}`, 50, infoBoxTop + 75)
      .text(`Order Status: ${order.orderStatus.toUpperCase()}`, 50, infoBoxTop + 90)
      .text(`Payment Status: ${order.paymentStatus.toUpperCase()}`, 50, infoBoxTop + 105);

    // Right side - Customer details box
    doc.roundedRect(320, infoBoxTop + 40, 230, 100, 5)
       .strokeColor('#15803d')
       .lineWidth(1)
       .stroke();

    doc.fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#15803d')
      .text('Bill To:', 330, infoBoxTop + 50)
      .font('Helvetica')
      .fillColor('#000000')
      .fontSize(10)
      .text(order.user.name || 'N/A', 330, infoBoxTop + 68)
      .text(order.user.email || 'N/A', 330, infoBoxTop + 83)
      .text(order.user.phone || order.contactNumber || 'N/A', 330, infoBoxTop + 98);

    // Delivery Address if available
    if (order.deliveryAddress && typeof order.deliveryAddress === 'object') {
      doc.fontSize(11)
        .font('Helvetica-Bold')
        .fillColor('#15803d')
        .text('Delivery Address:', 50, infoBoxTop + 150)
        .font('Helvetica')
        .fillColor('#000000')
        .fontSize(10)
        .text(order.deliveryAddress.street || '', 50, infoBoxTop + 168)
        .text(`${order.deliveryAddress.city || ''}, ${order.deliveryAddress.state || ''} ${order.deliveryAddress.zipCode || ''}`, 50, infoBoxTop + 183)
        .text(order.deliveryAddress.country || 'India', 50, infoBoxTop + 198);
    }

    doc.moveDown(3);

    // ===== ITEMS TABLE =====
    const tableTop = order.deliveryAddress ? 370 : 290;
    
    // Table header background
    doc.rect(50, tableTop, 500, 25).fill('#15803d');

    // Table headers
    doc.fontSize(11)
      .fillColor('#FFFFFF')
      .font('Helvetica-Bold')
      .text('Item Description', 60, tableTop + 8, { width: 200 })
      .text('Qty', 270, tableTop + 8, { width: 50, align: 'center' })
      .text('Unit Price', 330, tableTop + 8, { width: 80, align: 'right' })
      .text('Amount', 460, tableTop + 8, { width: 80, align: 'right' });

    // Items
    let yPosition = tableTop + 35;
    doc.fillColor('#000000').font('Helvetica');

    order.items.forEach((item, index) => {
      // Alternate row background
      if (index % 2 === 0) {
        doc.rect(50, yPosition - 5, 500, 25).fill('#f9fafb').stroke();
      }

      doc.fontSize(10)
        .fillColor('#000000')
        .text(item.name || 'Unknown Plant', 60, yPosition, { width: 200 })
        .text(item.quantity.toString(), 270, yPosition, { width: 50, align: 'center' })
        .text(`₹${item.price.toFixed(2)}`, 330, yPosition, { width: 80, align: 'right' })
        .text(`₹${item.subtotal.toFixed(2)}`, 460, yPosition, { width: 80, align: 'right' });

      yPosition += 25;
    });

    // Table border
    doc.rect(50, tableTop, 500, yPosition - tableTop).strokeColor('#cccccc').stroke();

    yPosition += 10;

    // ===== TOTAL SECTION =====
    // Subtotal
    doc.fontSize(10)
      .fillColor('#000000')
      .text('Subtotal:', 380, yPosition, { width: 80, align: 'right' })
      .text(`₹${order.totalAmount.toFixed(2)}`, 460, yPosition, { width: 80, align: 'right' });

    yPosition += 20;

    // Tax (GST 18%)
    const tax = order.totalAmount * 0.18;
    doc.text('GST (18%):', 380, yPosition, { width: 80, align: 'right' })
      .text(`₹${tax.toFixed(2)}`, 460, yPosition, { width: 80, align: 'right' });

    yPosition += 20;

    // Grand Total background
    doc.rect(370, yPosition - 5, 180, 30).fill('#15803d');

    doc.fontSize(12)
      .font('Helvetica-Bold')
      .fillColor('#FFFFFF')
      .text('Grand Total:', 380, yPosition + 5, { width: 80, align: 'right' })
      .text(`₹${(order.totalAmount + tax).toFixed(2)}`, 460, yPosition + 5, { width: 80, align: 'right' });

    // ===== FOOTER SECTION =====
    const footerTop = doc.page.height - 120;
    
    doc.fontSize(9)
      .fillColor('#666666')
      .font('Helvetica-Oblique')
      .text('Terms & Conditions:', 50, footerTop)
      .font('Helvetica')
      .fontSize(8)
      .text('• All plants are subject to availability', 50, footerTop + 15)
      .text('• Returns accepted within 7 days with valid reason', 50, footerTop + 27)
      .text('• Prices are inclusive of all applicable taxes', 50, footerTop + 39);

    // Thank you message
    doc.fontSize(12)
      .fillColor('#15803d')
      .font('Helvetica-Bold')
      .text('Thank you for choosing Green Haven Nursery! 🌱', 50, footerTop + 65, { 
        align: 'center', 
        width: 500 
      });

    doc.fontSize(9)
      .fillColor('#666666')
      .font('Helvetica')
      .text('For any queries, please contact us at support@greenhaven.com', 50, footerTop + 85, { 
        align: 'center', 
        width: 500 
      });

    doc.end();

    // Wait for PDF to be written
    stream.on('finish', async () => {
      // Update order with bill URL
      order.billUrl = `/bills/${filename}`;
      await order.save();

      res.json({
        success: true,
        message: 'Bill generated successfully',
        data: {
          billUrl: `/bills/${filename}`,
          filename
        }
      });
    });

    stream.on('error', (error) => {
      console.error('PDF generation error:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating bill',
        error: error.message
      });
    });
  } catch (error) {
    console.error('Generate bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating bill',
      error: error.message
    });
  }
};

// @desc    Share bill via Email or WhatsApp
// @route   POST /api/billing/share
// @access  Private/Admin
exports.shareBill = async (req, res) => {
  try {
    const { orderId, method } = req.body;

    const order = await Order.findById(orderId)
      .populate('user', 'name email phone');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.billUrl) {
      return res.status(400).json({
        success: false,
        message: 'Bill not generated yet. Please generate bill first.'
      });
    }

    const billPath = path.join(__dirname, '..', 'public', order.billUrl);

    if (!fs.existsSync(billPath)) {
      return res.status(404).json({
        success: false,
        message: 'Bill file not found'
      });
    }

    if (method === 'email') {
      // Send via Email
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: order.user.email,
        subject: `Invoice for Order ${order.orderId} - Green Haven Nursery`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #15803d;">🌿 Green Haven Nursery</h2>
            <p>Dear ${order.user.name},</p>
            <p>Thank you for your order! Please find your invoice attached.</p>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Total Amount:</strong> ₹${order.totalAmount.toFixed(2)}</p>
            <p><strong>Order Date:</strong> ${new Date(order.orderDate).toLocaleDateString()}</p>
            <p>We appreciate your business!</p>
            <br>
            <p style="color: #666;">Best regards,<br>Green Haven Nursery Team 🌱</p>
          </div>
        `,
        attachments: [
          {
            filename: path.basename(billPath),
            path: billPath
          }
        ]
      };

      await transporter.sendMail(mailOptions);

      res.json({
        success: true,
        message: 'Bill sent via email successfully'
      });

    } else if (method === 'whatsapp') {
      // Send via WhatsApp (using Twilio)
      if (!twilioClient) {
        return res.status(500).json({
          success: false,
          message: 'WhatsApp service not configured'
        });
      }

      const message = `🌿 Green Haven Nursery\n\nDear ${order.user.name},\n\nYour invoice for Order ${order.orderId} is ready.\nTotal Amount: ₹${order.totalAmount.toFixed(2)}\n\nYou can download your invoice from: ${process.env.FRONTEND_URL}/bills/${path.basename(billPath)}\n\nThank you for your purchase! 🌱`;

      await twilioClient.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${order.user.phone}`,
        body: message
      });

      res.json({
        success: true,
        message: 'Bill details sent via WhatsApp successfully'
      });

    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid sharing method. Use "email" or "whatsapp"'
      });
    }
  } catch (error) {
    console.error('Share bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sharing bill',
      error: error.message
    });
  }
};

// @desc    Get bill by order ID
// @route   GET /api/billing/:orderId
// @access  Private
exports.getBillById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    if (req.user.role !== 'admin' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this bill'
      });
    }

    if (!order.billUrl) {
      return res.status(404).json({
        success: false,
        message: 'Bill not generated for this order'
      });
    }

    res.json({
      success: true,
      data: {
        billUrl: order.billUrl,
        orderId: order.orderId
      }
    });
  } catch (error) {
    console.error('Get bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bill',
      error: error.message
    });
  }
};
