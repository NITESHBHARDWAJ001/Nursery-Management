import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Phone, FileText, ArrowLeft, CreditCard } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    contactNumber: user?.phone || '',
    notes: ''
  });

  if (!user) {
    navigate('/login');
    return null;
  }

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all delivery address fields');
      return;
    }

    if (!formData.contactNumber) {
      toast.error('Please provide contact number');
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          plant: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        contactNumber: formData.contactNumber,
        notes: formData.notes,
        orderType: 'onlineBooking'
      };

      const response = await api.post('/orders', orderData);
      
      if (response.data.success) {
        clearCart();
        toast.success('Order placed successfully!');
        navigate('/my-orders');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate('/cart')}
          className="flex items-center space-x-2 text-gray-600 hover:text-primary-600 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Cart</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <MapPin className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Delivery Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address *</label>
                    <input type="text" name="street" value={formData.street} onChange={handleChange} required className="input-field" placeholder="Enter street address" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input type="text" name="city" value={formData.city} onChange={handleChange} required className="input-field" placeholder="Enter city" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} required className="input-field" placeholder="Enter state" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code *</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} required className="input-field" placeholder="Enter ZIP code" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country *</label>
                    <input type="text" name="country" value={formData.country} onChange={handleChange} required className="input-field" placeholder="Enter country" />
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Phone className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Contact Information</h2>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Number *</label>
                  <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="input-field" placeholder="Enter contact number" />
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <FileText className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Order Notes (Optional)</h2>
                </div>

                <textarea name="notes" value={formData.notes} onChange={handleChange} rows="4" className="input-field" placeholder="Any special instructions or requests..." />
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <div className="flex items-center space-x-3 mb-6">
                  <ShoppingBag className="h-6 w-6 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
                </div>

                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img src={item.imageUrl || '/images/plants/default-plant.jpg'} alt={item.name} className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 pt-6 border-t border-gray-200">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Delivery</span>
                    <span className="font-semibold">
                      {deliveryCharge === 0 ? <span className="text-green-600">FREE</span> : `₹${deliveryCharge}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-primary-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-900">Payment Method</span>
                  </div>
                  <p className="text-sm text-blue-700">Cash on Delivery</p>
                </div>

                <button type="submit" disabled={loading} className="w-full btn-primary mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Placing Order...</span>
                    </div>
                  ) : (
                    'Place Order'
                  )}
                </button>

                <p className="text-xs text-center text-gray-500 mt-4">By placing your order, you agree to our terms and conditions</p>
              </motion.div>
            </div>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
};

export default Checkout;
