# 🌿 Plant Nursery Management System - Complete Setup Guide

## Project Overview
A full-stack MERN application for plant nursery management with ecommerce functionality, built with:
- **Backend:** Node.js, Express.js, MongoDB, JWT Authentication
- **Frontend:** React.js, Tailwind CSS v3, Framer Motion
- **Features:** Admin dashboard, ecommerce shop, stock management, automated reports, billing system

---

## 📦 Installation Steps

### 1. Install Dependencies

#### Backend Setup
```bash
# Navigate to root directory
cd e:\NMS

# Install backend dependencies
npm install
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install frontend dependencies
npm install
```

### 2. Environment Configuration

Create `.env` file in root directory:
```bash
cp .env.example .env
```

Update the following variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/plant_nursery
JWT_SECRET=your_super_secret_jwt_key_change_this

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Twilio (Optional - for WhatsApp)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

FRONTEND_URL=http://localhost:3000
```

### 3. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string and update `MONGODB_URI` in `.env`

### 4. Create Required Directories

```bash
# From root directory
mkdir -p backend/public/uploads/plants
mkdir -p backend/public/uploads/requests
mkdir -p backend/public/bills
mkdir -p backend/public/reports
mkdir -p frontend/public/images/plants
```

### 5. Add Sample Plant Images

Download plant images from Unsplash/Pexels and place them in:
`frontend/public/images/plants/`

Recommended images:
- Indoor plants (monstera, pothos, snake plant)
- Outdoor plants (roses, marigold, hibiscus)
- Succulents (aloe, jade, echeveria)
- Flowering plants (orchids, tulips, jasmine)

---

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd e:\NMS
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd e:\NMS\frontend
npm start
```

**Or run both simultaneously:**
```bash
cd e:\NMS
npm run dev:all
```

### Access Points
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **API Health Check:** http://localhost:5000/api/health

---

## 👤 User Accounts

### Create Admin Account
```bash
# Use the register endpoint with role: "admin"
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@greenhaven.com",
  "password": "admin123",
  "role": "admin",
  "phone": "+91 9876543210"
}
```

### Create Customer Account
```bash
# Register through UI or API with role: "user" (default)
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+91 9876543210"
}
```

---

## 🌱 Initial Data Setup

### Add Sample Plants (Admin Required)

Use Postman or the admin dashboard to add plants:

```bash
POST http://localhost:5000/api/plants
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data

# Form Data:
name: Monstera Deliciosa
category: indoor
description: Beautiful tropical plant with split leaves
price: 599
quantityAvailable: 50
careLevel: easy
sunlight: partial-sun
wateringFrequency: Weekly
tags: ["tropical", "air-purifying", "beginner-friendly"]
features: ["Low maintenance", "Air purifying", "Fast growing"]
# Upload image file
images: [plant_image.jpg]
```

### Sample Plants to Add:

1. **Monstera Deliciosa** - Indoor, ₹599
2. **Snake Plant** - Indoor, ₹399
3. **Jade Plant** - Succulent, ₹299
4. **Rose Plant** - Outdoor, ₹249
5. **Aloe Vera** - Succulent, ₹199
6. **Money Plant** - Indoor, ₹149
7. **Tulsi (Holy Basil)** - Herb, ₹99
8. **Marigold** - Flowering, ₹79

---

## 🔧 Configuration for Email/WhatsApp

### Gmail Setup (for billing emails)
1. Enable 2-Factor Authentication on your Gmail
2. Generate App Password:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Generate password for "Mail"
3. Use this password in `EMAIL_PASSWORD` in `.env`

### Twilio Setup (for WhatsApp notifications)
1. Sign up at https://www.twilio.com/
2. Get WhatsApp sandbox number
3. Add credentials to `.env`

---

## 📊 Features Overview

### Admin Features
- ✅ Dashboard with analytics
- ✅ Plant inventory management (CRUD)
- ✅ Stock management and tracking
- ✅ Order management
- ✅ Customer request management
- ✅ Sales reports and forecasting
- ✅ Bill generation and sharing
- ✅ Data export (CSV)

### User Features
- ✅ Browse plants with filters
- ✅ Add to cart and checkout
- ✅ View order history
- ✅ Download invoices
- ✅ Submit requests (new varieties, onsite plantation)
- ✅ Profile management

---

## 🎨 Customization

### Update Theme Colors
Edit `frontend/tailwind.config.js`:
```javascript
colors: {
  primary: {
    600: '#15803d', // Your primary color
  },
  // ... other colors
}
```

### Update Logo/Branding
- Replace logo in `Navbar.js` component
- Update company name and footer information

---

## 🐛 Troubleshooting

### MongoDB Connection Error
```bash
# Check if MongoDB is running
mongosh

# Or restart MongoDB service
sudo service mongod restart  # Linux
brew services restart mongodb-community  # macOS
```

### Port Already in Use
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:5000 | xargs kill -9
```

### CORS Issues
- Ensure `proxy: "http://localhost:5000"` is in `frontend/package.json`
- Check CORS configuration in `backend/server.js`

---

## 📝 API Documentation

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/profile` - Get user profile

### Plants
- GET `/api/plants` - Get all plants (with filters)
- GET `/api/plants/:id` - Get single plant
- POST `/api/plants` - Create plant (Admin)
- PUT `/api/plants/:id` - Update plant (Admin)
- DELETE `/api/plants/:id` - Delete plant (Admin)

### Orders
- POST `/api/orders` - Create order
- GET `/api/orders` - Get all orders (Admin)
- GET `/api/orders/user` - Get user orders
- PUT `/api/orders/:id/status` - Update order status (Admin)

### Reports
- GET `/api/reports/dashboard` - Dashboard stats (Admin)
- POST `/api/reports/generate` - Generate monthly report (Admin)
- GET `/api/reports/forecast` - Get demand forecast (Admin)

[Full API docs available in Postman collection]

---

## 🚀 Deployment

### Backend Deployment (Heroku/Render)
```bash
# Add Procfile
web: node backend/server.js

# Set environment variables on hosting platform
# Deploy
```

### Frontend Deployment (Vercel/Netlify)
```bash
cd frontend
npm run build

# Deploy dist folder
```

---

## 📧 Support

For issues or questions:
- Email: support@greenhaven.com
- GitHub Issues: [Create Issue]

---

## 📄 License

MIT License - Feel free to use and modify!

---

## 🎉 Ready to Go!

Your Plant Nursery Management System is now set up!

**Next Steps:**
1. Start both backend and frontend servers
2. Create admin account
3. Add sample plants
4. Test the complete flow

**Happy Coding! 🌿**
