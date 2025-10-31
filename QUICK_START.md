# 🚀 QUICK START GUIDE - Plant Nursery Management System

## ⚡ Fast Setup (5 Minutes)

### Step 1: Install Dependencies
```bash
# Open Command Prompt in e:\NMS

# Install backend
npm install

# Install frontend
cd frontend
npm install
cd ..
```

### Step 2: Setup Environment
```bash
# Copy environment template
copy .env.example .env

# Edit .env and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random secret key)
# - EMAIL_USER and EMAIL_PASSWORD (optional for billing)
```

### Step 3: Start MongoDB
```bash
# Make sure MongoDB is running
# If installed locally, it should start automatically
# Or run: mongod
```

### Step 4: Run the Application
```bash
# Option A: Run separately
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm start

# Option B: Run both together
npm run dev:all
```

### Step 5: Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## 📝 First Time Setup

### Create Admin Account
```bash
# Using browser:
1. Go to http://localhost:3000/register
2. Fill the form
3. In browser console, modify the request to set role: "admin"

# Or use Postman/API:
POST http://localhost:5000/api/auth/register
{
  "name": "Admin User",
  "email": "admin@greenhaven.com",
  "password": "admin123",
  "phone": "+91 9876543210",
  "role": "admin"
}
```

### Login
```
Email: admin@greenhaven.com
Password: admin123
```

### Add Plants
1. Login as admin
2. Go to Admin Dashboard → Plant Management
3. Click "Add New Plant"
4. Fill details and upload image
5. Save

---

## 🎯 Testing the Application

### Test User Flow
1. ✅ Register as user
2. ✅ Browse plants in shop
3. ✅ Add plants to cart
4. ✅ Checkout and place order
5. ✅ View order in "My Orders"
6. ✅ Submit a request for onsite plantation
7. ✅ View profile

### Test Admin Flow
1. ✅ Login as admin
2. ✅ View dashboard statistics
3. ✅ Add/Edit/Delete plants
4. ✅ Update stock quantities
5. ✅ Manage orders (update status)
6. ✅ Generate reports
7. ✅ Generate and share bills
8. ✅ Approve/Reject user requests
9. ✅ Export data to CSV

---

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### MongoDB Connection Error
```bash
# Check MongoDB status
mongosh

# Install MongoDB if not installed:
# Download from: https://www.mongodb.com/try/download/community
```

### Missing Dependencies
```bash
# Reinstall backend
cd e:\NMS
rmdir /s /q node_modules
npm install

# Reinstall frontend
cd frontend
rmdir /s /q node_modules
npm install
```

### CORS Errors
- Check `proxy: "http://localhost:5000"` in frontend/package.json
- Restart both servers

---

## 📦 Included Sample Data

### Sample Admin Account
- Email: admin@greenhaven.com
- Password: admin123

### Sample Plants to Add
1. **Monstera Deliciosa**
   - Category: Indoor
   - Price: ₹599
   - Description: Beautiful tropical plant with split leaves

2. **Snake Plant**
   - Category: Indoor
   - Price: ₹399
   - Description: Low-maintenance air-purifying plant

3. **Jade Plant**
   - Category: Succulent
   - Price: ₹299
   - Description: Lucky plant with thick, fleshy leaves

4. **Money Plant**
   - Category: Indoor
   - Price: ₹149
   - Description: Easy to grow, brings prosperity

5. **Aloe Vera**
   - Category: Succulent
   - Price: ₹199
   - Description: Medicinal plant with healing properties

---

## 🌐 API Endpoints Quick Reference

### Authentication
- POST `/api/auth/register` - Register
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get profile

### Plants
- GET `/api/plants` - Get all plants
- GET `/api/plants/:id` - Get single plant
- POST `/api/plants` - Add plant (Admin)
- PUT `/api/plants/:id` - Update plant (Admin)
- DELETE `/api/plants/:id` - Delete plant (Admin)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders` - Get all orders (Admin)
- GET `/api/orders/user` - Get user orders
- PUT `/api/orders/:id/status` - Update status (Admin)

### Stock
- POST `/api/stock/update` - Update stock (Admin)
- GET `/api/stock/transactions` - Get transactions (Admin)

### Reports
- GET `/api/reports/dashboard` - Dashboard stats (Admin)
- POST `/api/reports/generate` - Generate report (Admin)
- GET `/api/reports/forecast` - Get forecast (Admin)
- GET `/api/reports/export` - Export data (Admin)

### Billing
- POST `/api/billing/generate` - Generate bill (Admin)
- POST `/api/billing/share` - Share bill via email/WhatsApp (Admin)
- GET `/api/billing/:orderId` - Get bill

### Requests
- POST `/api/requests` - Create request
- GET `/api/requests` - Get all requests (Admin)
- GET `/api/requests/user` - Get user requests
- PUT `/api/requests/:id/status` - Update status (Admin)

---

## 🎨 Customization

### Change Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: {
        600: '#15803d', // Change this
      }
    }
  }
}
```

### Update Company Name
1. `frontend/src/components/Navbar.js` - Update logo text
2. `frontend/src/components/Footer.js` - Update footer info
3. `backend/controllers/billingController.js` - Update bill header

### Add Plant Images
Place images in: `frontend/public/images/plants/`
Reference as: `/images/plants/your-image.jpg`

---

## 📊 Features Checklist

### Admin Features
- [x] Dashboard with statistics
- [x] Plant CRUD operations
- [x] Image upload for plants
- [x] Stock management
- [x] Order management
- [x] Report generation
- [x] Sales forecasting
- [x] Bill generation (PDF)
- [x] Bill sharing (Email/WhatsApp)
- [x] Data export (CSV)
- [x] Request management

### User Features
- [x] Browse plants with filters
- [x] Search plants
- [x] Add to cart
- [x] Place orders
- [x] View order history
- [x] Download invoices
- [x] Submit requests
- [x] Profile management

### Technical Features
- [x] JWT Authentication
- [x] Role-based access
- [x] Protected routes
- [x] File uploads
- [x] Automated reports (Cron)
- [x] Email integration
- [x] WhatsApp integration (optional)
- [x] Responsive design
- [x] Animations
- [x] Toast notifications

---

## 📚 Documentation Files

1. **README.md** - Project overview
2. **SETUP_GUIDE.md** - Detailed setup instructions
3. **PROJECT_SUMMARY.md** - Complete feature list
4. **QUICK_START.md** - This file (fast setup)
5. **.env.example** - Environment template

---

## 🆘 Support & Resources

### MongoDB Resources
- Install: https://www.mongodb.com/try/download/community
- Atlas (Cloud): https://www.mongodb.com/cloud/atlas
- Docs: https://docs.mongodb.com/

### Node.js & npm
- Download: https://nodejs.org/
- Version required: 16+

### Useful Commands
```bash
# Check versions
node --version
npm --version
mongod --version

# Clear npm cache
npm cache clean --force

# Update npm
npm install -g npm@latest

# View running processes
netstat -ano

# MongoDB commands
mongosh  # Connect to MongoDB
show dbs  # List databases
use plant_nursery  # Switch to database
db.users.find()  # Query users
```

---

## 🎉 You're All Set!

Your Plant Nursery Management System is ready to use!

**Access Points:**
- 🌐 Website: http://localhost:3000
- 🔌 API: http://localhost:5000/api
- 📊 Admin Dashboard: http://localhost:3000/admin

**Default Credentials:**
- Admin: admin@greenhaven.com / admin123

**Need Help?**
- Check SETUP_GUIDE.md for detailed instructions
- Review PROJECT_SUMMARY.md for feature details
- Check console logs for errors

**Happy Gardening! 🌿🌱🪴**
