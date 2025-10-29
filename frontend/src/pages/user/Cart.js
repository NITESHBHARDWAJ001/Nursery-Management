import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleUpdateQuantity = (item, newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > item.quantityAvailable) {
      toast.error(`Only ${item.quantityAvailable} units available`);
      return;
    }
    updateQuantity(item._id, newQuantity);
  };

  const handleRemoveItem = (item) => {
    removeFromCart(item._id);
    toast.success(`${item.name} removed from cart`);
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      clearCart();
      toast.success('Cart cleared');
    }
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-primary-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-lg">
                <ShoppingBag className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">
              Looks like you haven't added any plants yet.
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>Continue Shopping</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  const subtotal = getCartTotal();
  const deliveryCharge = subtotal >= 999 ? 0 : 50;
  const total = subtotal + deliveryCharge;

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Shopping Cart</h1>
          <button
            onClick={handleClearCart}
            className="text-red-600 hover:text-red-700 font-medium transition-colors"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Product Image */}
                  <div className="sm:w-48 h-48 sm:h-auto flex-shrink-0">
                    <img
                      src={item.imageUrl || '/images/plants/default-plant.jpg'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-col sm:flex-row justify-between">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2 capitalize">
                          {item.category}
                        </p>
                        <p className="text-lg font-bold text-primary-600 mb-4">
                          ₹{item.price}
                        </p>

                        {/* Stock Status */}
                        {item.quantityAvailable <= item.lowStockThreshold && (
                          <p className="text-sm text-orange-600 font-medium mb-4">
                            Only {item.quantityAvailable} left in stock
                          </p>
                        )}

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-4">
                          <span className="text-sm font-medium text-gray-700">Quantity:</span>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="p-2 rounded-lg border border-gray-300 hover:border-primary-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 text-center font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                              disabled={item.quantity >= item.quantityAvailable}
                              className="p-2 rounded-lg border border-gray-300 hover:border-primary-600 hover:text-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Remove Button & Subtotal */}
                      <div className="flex flex-row sm:flex-col justify-between sm:justify-start items-end sm:items-end mt-4 sm:mt-0 sm:ml-4">
                        <button
                          onClick={() => handleRemoveItem(item)}
                          className="text-red-600 hover:text-red-700 transition-colors p-2"
                          title="Remove from cart"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">Subtotal</p>
                          <p className="text-xl font-bold text-gray-900">
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal ({cartItems.length} items)</span>
                  <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-gray-700">
                  <span>Delivery Charges</span>
                  <span className="font-semibold">
                    {deliveryCharge === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${deliveryCharge}`
                    )}
                  </span>
                </div>

                {subtotal < 999 && (
                  <p className="text-sm text-gray-600 bg-yellow-50 p-3 rounded-lg">
                    Add items worth ₹{(999 - subtotal).toFixed(2)} more to get free delivery!
                  </p>
                )}

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span className="text-primary-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-primary flex items-center justify-center space-x-2 mb-4"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="h-5 w-5" />
              </button>

              <button
                onClick={() => navigate('/shop')}
                className="w-full btn-secondary"
              >
                Continue Shopping
              </button>

              {/* Benefits */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>100% quality guarantee</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>Secure payment options</span>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <span>7-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
