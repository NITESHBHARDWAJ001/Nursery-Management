import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Eye, Download, Mail, MessageSquare, X, Calendar } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const OrderManagement = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [shareEmail, setShareEmail] = useState('');
  const [sharePhone, setSharePhone] = useState('');

  const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  const typeOptions = ['shopPurchase', 'onlineBooking', 'onsitePlantation'];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, statusFilter, typeFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { orderStatus: statusFilter }),
        ...(typeFilter !== 'all' && { orderType: typeFilter })
      });

      const response = await api.get(`/orders?${params}`);
      setOrders(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus: newStatus });
      toast.success('Order status updated!');
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const handleGenerateBill = async (orderId) => {
    try {
      const loadingToast = toast.loading('Generating bill...');
      const response = await api.post(`/billing/generate`, { orderId });
      toast.dismiss(loadingToast);
      toast.success('Bill generated and downloaded successfully!');
      
      if (response.data.data?.billUrl) {
        // Create a temporary link element to trigger download
        const billUrl = `http://localhost:5000${response.data.data.billUrl}`;
        const link = document.createElement('a');
        link.href = billUrl;
        link.download = response.data.data.filename || 'invoice.pdf';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Also open in new tab for viewing
        setTimeout(() => {
          window.open(billUrl, '_blank');
        }, 500);
      }
      
      fetchOrders();
    } catch (error) {
      console.error('Error generating bill:', error);
      toast.error(error.response?.data?.message || 'Failed to generate bill');
    }
  };

  const handleShareBill = async (method) => {
    if (!selectedOrder) return;

    try {
      if (method === 'email' && !shareEmail) {
        toast.error('Please enter an email address');
        return;
      }
      if (method === 'whatsapp' && !sharePhone) {
        toast.error('Please enter a phone number');
        return;
      }

      await api.post('/billing/share', {
        orderId: selectedOrder._id,
        method,
        ...(method === 'email' && { email: shareEmail }),
        ...(method === 'whatsapp' && { phoneNumber: sharePhone })
      });

      toast.success(`Bill shared via ${method}!`);
      setShowShareModal(false);
      setShareEmail('');
      setSharePhone('');
    } catch (error) {
      console.error('Error sharing bill:', error);
      toast.error('Failed to share bill');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Order Management</h1>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Management</h1>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                  <option value="all">All Statuses</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                  ))}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
                  <option value="all">All Types</option>
                  <option value="shopPurchase">Shop Purchase</option>
                  <option value="onlineBooking">Online Booking</option>
                  <option value="onsitePlantation">Onsite Plantation</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <p className="text-gray-500">No orders found</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-mono text-sm">{order._id.slice(-8)}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{order.user?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{order.user?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4 text-sm">{new Date(order.orderDate).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}
                            >
                              {statusOptions.map(status => (
                                <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 font-semibold text-primary-600">₹{order.totalAmount}</td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedOrder(order);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-5 w-5 inline" />
                            </button>
                            {order.billUrl ? (
                              <button
                                onClick={() => {
                                  const billUrl = `http://localhost:5000${order.billUrl}`;
                                  window.open(billUrl, '_blank');
                                }}
                                className="text-green-600 hover:text-green-800"
                                title="View/Download Bill"
                              >
                                <Download className="h-5 w-5 inline" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleGenerateBill(order._id)}
                                className="text-primary-600 hover:text-primary-800"
                                title="Generate Bill"
                              >
                                <Download className="h-5 w-5 inline" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-mono text-sm text-gray-600">#{order._id.slice(-8)}</p>
                          <p className="font-medium text-gray-900">{order.user?.name || 'N/A'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600 mb-3">
                        <p><Calendar className="h-4 w-4 inline mr-2" />{new Date(order.orderDate).toLocaleDateString()}</p>
                        <p className="text-lg font-semibold text-primary-600">₹{order.totalAmount}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 btn-secondary text-sm"
                        >
                          View Details
                        </button>
                        {order.billUrl ? (
                          <button
                            onClick={() => window.open(order.billUrl, '_blank')}
                            className="btn-primary text-sm px-4"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleGenerateBill(order._id)}
                            className="btn-primary text-sm px-4"
                          >
                            Bill
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Order Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono font-medium">#{selectedOrder._id.slice(-8)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="font-medium">{new Date(selectedOrder.orderDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <select
                      value={selectedOrder.orderStatus}
                      onChange={(e) => handleStatusUpdate(selectedOrder._id, e.target.value)}
                      className={`mt-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.orderStatus)}`}
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Type</p>
                    <p className="font-medium capitalize">{selectedOrder.orderType?.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-lg mb-3">Customer Information</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedOrder.user?.name || 'N/A'}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedOrder.user?.email || 'N/A'}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedOrder.user?.phone || selectedOrder.contactNumber || 'N/A'}</p>
                  </div>
                </div>

                {selectedOrder.deliveryAddress && (
                  <div>
                    <h3 className="font-bold text-lg mb-3">Delivery Address</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {typeof selectedOrder.deliveryAddress === 'object' ? (
                        <>
                          <p>{selectedOrder.deliveryAddress.street}</p>
                          <p>{selectedOrder.deliveryAddress.city}, {selectedOrder.deliveryAddress.state} {selectedOrder.deliveryAddress.zipCode}</p>
                          <p>{selectedOrder.deliveryAddress.country}</p>
                        </>
                      ) : (
                        <p>{selectedOrder.deliveryAddress}</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-lg mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="font-medium">{item.plantId?.name || 'Plant'}</p>
                          <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold text-primary-600">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total Amount</span>
                      <span className="text-primary-600">₹{selectedOrder.totalAmount}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  {selectedOrder.billUrl ? (
                    <>
                      <button
                        onClick={() => window.open(selectedOrder.billUrl, '_blank')}
                        className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                      >
                        <Download className="h-5 w-5" />
                        <span>Download Bill</span>
                      </button>
                      <button
                        onClick={() => setShowShareModal(true)}
                        className="flex-1 btn-primary flex items-center justify-center space-x-2"
                      >
                        <Mail className="h-5 w-5" />
                        <span>Share Bill</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleGenerateBill(selectedOrder._id)}
                      className="flex-1 btn-primary"
                    >
                      Generate Bill
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowShareModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Share Bill</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share via Email</label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    className="flex-1 input-field"
                  />
                  <button
                    onClick={() => handleShareBill('email')}
                    className="btn-primary px-4"
                  >
                    <Mail className="h-5 w-5" />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Share via WhatsApp</label>
                <div className="flex space-x-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    value={sharePhone}
                    onChange={(e) => setSharePhone(e.target.value)}
                    className="flex-1 input-field"
                  />
                  <button
                    onClick={() => handleShareBill('whatsapp')}
                    className="btn-primary px-4"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
