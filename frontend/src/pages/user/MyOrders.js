import React, { useState, useEffect } from 'react';  

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Download, Eye, ShoppingBag, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MyOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/user');
      setOrders(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'shipped':
        return <Truck className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'shipped':
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownloadBill = (order) => {
    if (order.billUrl) {
      window.open(order.billUrl, '_blank');
    } else {
      toast.error('Bill not available for this order');
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filterStatus);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center bg-primary-50">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
            <p className="text-gray-600">Track and manage your orders</p>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="mt-4 sm:mt-0 input-field w-full sm:w-auto"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-lg">
                <ShoppingBag className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No orders found</h2>
            <p className="text-gray-600 mb-8">
              {filterStatus === 'all' 
                ? "You haven't placed any orders yet."
                : `No ${filterStatus} orders found.`}
            </p>
            <button onClick={() => navigate('/shop')} className="btn-primary">
              Start Shopping
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 pb-4 border-b border-gray-200">
                    <div>
                      <div className="flex items-center space-x-3 mb-2">
                        <Package className="h-5 w-5 text-primary-600" />
                        <span className="font-bold text-lg text-gray-900">{order.orderId}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Ordered on {new Date(order.orderDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        <span className="font-medium capitalize">{order.orderStatus}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.name}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity} × ₹{item.price}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{item.subtotal.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                      <p className="text-2xl font-bold text-primary-600">₹{order.totalAmount.toFixed(2)}</p>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
                      <button onClick={() => setSelectedOrder(order)} className="btn-secondary flex items-center space-x-2">
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>

                      {order.billUrl && (
                        <button onClick={() => handleDownloadBill(order)} className="btn-primary flex items-center space-x-2">
                          <Download className="h-4 w-4" />
                          <span>Download Bill</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Details</h2>
                  <p className="text-gray-600">{selectedOrder.orderId}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity} × ₹{item.price}</p>
                      </div>
                      <p className="font-semibold">₹{item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Delivery Address</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-900">{selectedOrder.deliveryAddress.street}</p>
                  <p className="text-gray-900">{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state}</p>
                  <p className="text-gray-900">{selectedOrder.deliveryAddress.zipCode}, {selectedOrder.deliveryAddress.country}</p>
                  <p className="text-gray-600 mt-2">Contact: {selectedOrder.contactNumber}</p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-3">Order Status</h3>
                <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${getStatusColor(selectedOrder.orderStatus)}`}>
                  {getStatusIcon(selectedOrder.orderStatus)}
                  <span className="font-medium capitalize">{selectedOrder.orderStatus}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                  <span className="text-2xl font-bold text-primary-600">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyOrders;
