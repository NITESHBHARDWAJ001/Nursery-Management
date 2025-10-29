import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Public Pages
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import PlantDetails from './pages/user/PlantDetails';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import MyOrders from './pages/user/MyOrders';
import RequestForm from './pages/user/RequestForm';
import MyRequests from './pages/user/MyRequests';
import UserProfile from './pages/user/UserProfile';
import MyReviews from './pages/user/MyReviews';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import PlantManagement from './pages/admin/PlantManagement';
import OrderManagement from './pages/admin/OrderManagement';
import StockManagement from './pages/admin/StockManagement';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import RequestManagement from './pages/admin/RequestManagement';
import ShopSale from './pages/admin/ShopSale';
import ShopSalesExport from './pages/admin/ShopSalesExport';
import ReviewManagement from './pages/admin/ReviewManagement';

// Components
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="App">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#fff',
                  color: '#333',
                },
                success: {
                  iconTheme: {
                    primary: '#16a34a',
                    secondary: '#fff',
                  },
                },
              }}
            />
            
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/plant/:id" element={<PlantDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* User Protected Routes */}
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/my-orders" element={<PrivateRoute><MyOrders /></PrivateRoute>} />
              <Route path="/request" element={<PrivateRoute><RequestForm /></PrivateRoute>} />
              <Route path="/my-requests" element={<PrivateRoute><MyRequests /></PrivateRoute>} />
              <Route path="/my-reviews" element={<PrivateRoute><MyReviews /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/plants" element={<AdminRoute><PlantManagement /></AdminRoute>} />
              <Route path="/admin/orders" element={<AdminRoute><OrderManagement /></AdminRoute>} />
              <Route path="/admin/stock" element={<AdminRoute><StockManagement /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><ReportsAnalytics /></AdminRoute>} />
              <Route path="/admin/requests" element={<AdminRoute><RequestManagement /></AdminRoute>} />
              <Route path="/admin/reviews" element={<AdminRoute><ReviewManagement /></AdminRoute>} />
              <Route path="/admin/shop-sale" element={<AdminRoute><ShopSale /></AdminRoute>} />
              <Route path="/admin/shop-sales-export" element={<AdminRoute><ShopSalesExport /></AdminRoute>} />
              
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
