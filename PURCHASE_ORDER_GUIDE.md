# 📦 Purchase Order System - Complete Guide

## Overview
The Plant Nursery Management System now includes an intelligent **Purchase Order Generation System** that automatically identifies low-stock plants and creates professional purchase orders in both **PDF** and **Excel/CSV** formats.

---

## ✨ Key Features

### 1. **Automatic Low-Stock Detection**
- ✅ Scans inventory for plants below threshold
- ✅ Calculates required quantities automatically
- ✅ Adds 20% safety buffer to prevent future stockouts
- ✅ Estimates purchase costs (60% of selling price)

### 2. **Professional PDF Generation**
- ✅ Company-branded header
- ✅ Unique PO number (PO-timestamp format)
- ✅ Detailed itemized table
- ✅ Approval sections for authorization
- ✅ Terms & conditions
- ✅ Auto-download and preview

### 3. **Excel/CSV Export**
- ✅ Spreadsheet-friendly format
- ✅ Easy to edit and share
- ✅ Includes all plant details
- ✅ Automatic totals calculation
- ✅ Compatible with Excel, Google Sheets, etc.

---

## 🚀 How to Use

### For Admins

#### 1. Access Stock Management
1. Login as admin: `admin@greenhaven.com` / `admin123`
2. Navigate to **Stock Management** (`/admin/stock`)
3. You'll see two buttons at the top:
   - **Generate PO (PDF)** 📄
   - **Export PO (Excel)** 📊

#### 2. Generate PDF Purchase Order
1. Click **"Generate PO (PDF)"** button
2. Wait for generation (usually 1-2 seconds)
3. PDF will:
   - ✅ Automatically download to your computer
   - ✅ Open in new tab for viewing
4. Check the document for:
   - Plant names
   - Current stock levels
   - Required quantities
   - Estimated costs

#### 3. Export to Excel/CSV
1. Click **"Export PO (Excel)"** button
2. CSV file will download automatically
3. Open in:
   - Microsoft Excel
   - Google Sheets
   - LibreOffice Calc
   - Any spreadsheet application
4. Edit if needed (add supplier details, adjust quantities, etc.)

#### 4. View Stock Transactions
- Table shows all stock movements
- Each row displays:
  - ✅ **Date** - When transaction occurred
  - ✅ **Plant Name** - Which plant was affected
  - ✅ **Type** - purchased/sold/adjustment/damaged/returned
  - ✅ **Quantity** - Amount changed (+/-)
  - ✅ **Stock** - Before → After levels
  - ✅ **Cost** - Total transaction cost

---

## 📄 Purchase Order Format

### PDF Layout

```
═══════════════════════════════════════════════════════════
                  🌿 GREEN HAVEN NURSERY
           Purchase Order for Stock Replenishment
    📍 123 Garden Street, Green Valley, GH 12345
    📞 +91-1234567890 | ✉️ procurement@greenhaven.com
═══════════════════════════════════════════════════════════

PURCHASE ORDER

PO Details:                        Supplier:
PO Number: PO-1729425600000       ┌──────────────────────────┐
Date: 20-Oct-2025                 │ To be assigned by        │
Total Items: 5                    │ Procurement Team         │
                                  │ Contact:                 │
                                  │ procurement@greenhaven   │
                                  └──────────────────────────┘

───────────────────────────────────────────────────────────
 Plant Name         Current  Threshold  Order Qty  Est. Cost
───────────────────────────────────────────────────────────
 Snake Plant          5         10          7      ₹1,260.00
 Money Plant          3         15         15      ₹1,800.00
 Aloe Vera            2         10         10      ₹1,200.00
 Peace Lily           4         12         11      ₹1,650.00
 Spider Plant         6         15         13      ₹1,300.00
───────────────────────────────────────────────────────────

Total Items: 5
Estimated Total Cost: ₹7,210.00
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL AMOUNT: ₹7,210.00

Important Notes:
• Order quantities calculated to reach threshold + 20% safety buffer
• Estimated costs based on 60% of current selling price
• Please verify supplier prices before placing final order
• Expected delivery time: 7-10 business days
• Contact procurement team for supplier assignment and approval

Approval & Authorization:

┌──────────────────────┐        ┌──────────────────────┐
│ Prepared By:         │        │ Approved By:         │
│ Name: ______________ │        │ Name: ______________ │
│ Date: ______________ │        │ Date: ______________ │
└──────────────────────┘        └──────────────────────┘

This is a system-generated purchase order based on current stock levels.
Generated on: 20/10/2025, 10:30:45 AM
```

### Excel/CSV Format

| Date       | Plant Name   | Category | Current Stock | Threshold | Order Quantity | Unit Price (₹) | Estimated Cost (₹) |
|------------|--------------|----------|---------------|-----------|----------------|----------------|---------------------|
| 20/10/2025 | Snake Plant  | indoor   | 5             | 10        | 7              | 180.00         | 1,260.00            |
| 20/10/2025 | Money Plant  | indoor   | 3             | 15        | 15             | 120.00         | 1,800.00            |
| 20/10/2025 | Aloe Vera    | medicinal| 2             | 10        | 10             | 120.00         | 1,200.00            |
| 20/10/2025 | Peace Lily   | indoor   | 4             | 12        | 11             | 150.00         | 1,650.00            |
| 20/10/2025 | Spider Plant | indoor   | 6             | 15        | 13             | 100.00         | 1,300.00            |
|            | **TOTAL**    |          |               |           | **56**         |                | **7,210.00**        |

---

## 🧮 Calculation Logic

### Order Quantity Formula
```javascript
orderQuantity = ceil((threshold × 1.2) - currentStock)
```

**Example:**
- Plant: Snake Plant
- Current Stock: 5 units
- Threshold: 10 units
- Calculation: ceil((10 × 1.2) - 5) = ceil(12 - 5) = **7 units**

**Why 20% buffer?**
- Prevents immediate reordering
- Accounts for sales during delivery time
- Provides safety margin for demand spikes

### Cost Estimation Formula
```javascript
estimatedCost = orderQuantity × (sellingPrice × 0.6)
```

**Example:**
- Plant: Snake Plant
- Order Quantity: 7 units
- Selling Price: ₹300
- Calculation: 7 × (300 × 0.6) = 7 × 180 = **₹1,260**

**Why 60% of selling price?**
- Industry standard wholesale markup
- Accounts for typical supplier pricing
- Provides cost estimate for budgeting
- Actual supplier quotes may vary

---

## 🔧 Technical Implementation

### Backend API Endpoints

#### 1. Generate PDF Purchase Order
```http
POST /api/stock/purchase-order
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order generated successfully",
  "data": {
    "poNumber": "PO-1729425600000",
    "filename": "purchase_order_PO-1729425600000.pdf",
    "downloadUrl": "/purchase-orders/purchase_order_PO-1729425600000.pdf",
    "itemCount": 5,
    "totalCost": "7210.00"
  }
}
```

#### 2. Export Excel/CSV Purchase Order
```http
POST /api/stock/export-purchase-order
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase order exported successfully",
  "data": {
    "poNumber": "PO-1729425600000",
    "filename": "purchase_order_PO-1729425600000.csv",
    "downloadUrl": "/purchase-orders/purchase_order_PO-1729425600000.csv",
    "itemCount": 5,
    "totalCost": "7210.00"
  }
}
```

### File Storage

```
backend/
└── public/
    └── purchase-orders/
        ├── purchase_order_PO-1729425600000.pdf
        ├── purchase_order_PO-1729425600000.csv
        ├── purchase_order_PO-1729425610000.pdf
        └── ...
```

### Frontend Integration

```javascript
// StockManagement.js
const handleGeneratePurchaseOrder = async (format = 'pdf') => {
  const loadingToast = toast.loading(`Generating purchase order (${format})...`);
  
  const endpoint = format === 'pdf' 
    ? '/stock/purchase-order' 
    : '/stock/export-purchase-order';
  
  const response = await api.post(endpoint);
  
  // Auto-download
  const downloadUrl = `http://localhost:5000${response.data.data.downloadUrl}`;
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = response.data.data.filename;
  link.click();
  
  // Also open in new tab
  window.open(downloadUrl, '_blank');
  
  toast.success('Purchase order generated successfully!');
};
```

---

## 📊 Use Cases

### Scenario 1: Daily Stock Check
**Situation:** End of day inventory review

**Steps:**
1. Admin logs in
2. Navigates to Stock Management
3. Reviews transaction table
4. Notices low stock indicators
5. Clicks "Generate PO (PDF)"
6. Reviews purchase order
7. Approves and sends to supplier

### Scenario 2: Weekly Procurement Meeting
**Situation:** Planning weekly orders

**Steps:**
1. Click "Export PO (Excel)"
2. Open CSV in Excel
3. Share with procurement team
4. Team reviews and adjusts quantities
5. Adds supplier information
6. Finalizes and sends official order

### Scenario 3: Budget Planning
**Situation:** Monthly budget review

**Steps:**
1. Generate PDF purchase order
2. Check total estimated cost
3. Compare with budget allocation
4. Adjust thresholds if needed
5. Plan procurement strategy

---

## 🎯 Benefits

### For Inventory Management
- ✅ Never run out of stock
- ✅ Automated reorder point detection
- ✅ Consistent stock levels maintained
- ✅ Reduced manual monitoring

### For Procurement Team
- ✅ Ready-to-use purchase orders
- ✅ Professional documentation
- ✅ Clear quantity requirements
- ✅ Cost estimates for budgeting

### For Finance Department
- ✅ Budget forecasting
- ✅ Cost tracking
- ✅ Expense planning
- ✅ Financial reporting

### For Business Operations
- ✅ Improved efficiency
- ✅ Reduced stockouts
- ✅ Better customer satisfaction
- ✅ Streamlined procurement process

---

## 🔍 Troubleshooting

### Issue: "No plants below stock threshold"
**Solution:** This means all plants have sufficient stock. No purchase order needed!

**Check:**
- Review plant stock levels in Plant Management
- Adjust thresholds if too low
- This is actually good news - no urgent restocking needed!

### Issue: PDF doesn't download
**Solution:** Check browser popup blocker

**Steps:**
1. Allow popups for `localhost:3000`
2. Check Downloads folder
3. Try again

### Issue: Excel file won't open
**Solution:** File is CSV format, compatible with all spreadsheet apps

**Steps:**
1. Right-click file
2. "Open with" → Excel/Google Sheets
3. Or import into spreadsheet application

### Issue: Costs seem incorrect
**Solution:** Estimates are based on 60% of selling price

**Note:**
- These are ESTIMATES only
- Always verify with actual supplier quotes
- Adjust percentages in code if needed for your business

---

## 📈 Future Enhancements

### Planned Features
- [ ] Supplier database integration
- [ ] Auto-email to suppliers
- [ ] Multiple supplier quotes comparison
- [ ] Historical PO tracking
- [ ] Seasonal demand forecasting
- [ ] Integration with accounting software
- [ ] Digital signature support
- [ ] Multi-currency support
- [ ] Barcode generation for tracking
- [ ] Mobile app for on-the-go PO generation

---

## 📞 Support

### Need Help?
- Check main documentation: `README.md`
- Review fixes: `FIXES_APPLIED.md`
- For technical issues, check backend logs
- For UI issues, check browser console

### Credentials
**Admin Account:**
- Email: `admin@greenhaven.com`
- Password: `admin123`

---

## 🎉 Success!

Your Plant Nursery Management System now has a **fully automated purchase order system** that:

✅ Identifies low-stock plants automatically  
✅ Calculates required quantities intelligently  
✅ Generates professional PDF documents  
✅ Exports to Excel/CSV for easy editing  
✅ Shows clear plant names and dates  
✅ Provides cost estimates for budgeting  
✅ Streamlines procurement workflow  
✅ Saves time and reduces errors  

**Happy ordering! 🌱📦**

---

**Last Updated**: October 20, 2025  
**Version**: 1.0.0  
**Status**: ✅ Production Ready
