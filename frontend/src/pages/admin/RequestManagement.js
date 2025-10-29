import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Eye, CheckCircle, XCircle, AlertTriangle, X } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const RequestManagement = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [approveData, setApproveData] = useState({
    adminNotes: '',
    estimatedCost: ''
  });

  const [rejectNotes, setRejectNotes] = useState('');

  const statusOptions = ['pending', 'approved', 'rejected', 'in-progress', 'completed'];
  const typeOptions = ['newVariety', 'onsitePlantation', 'customOrder', 'consultation'];
  const priorityOptions = ['low', 'medium', 'high'];

  const typeIcons = {
    newVariety: '🌱',
    onsitePlantation: '🏡',
    customOrder: '📦',
    consultation: '💡'
  };

  const typeNames = {
    newVariety: 'New Variety Request',
    onsitePlantation: 'Onsite Plantation',
    customOrder: 'Custom Order',
    consultation: 'Consultation'
  };

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter, typeFilter, priorityFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(typeFilter !== 'all' && { requestType: typeFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter })
      });

      const response = await api.get(`/requests?${params}`);
      setRequests(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!approveData.adminNotes || !approveData.estimatedCost) {
      toast.error('Please provide admin notes and estimated cost');
      return;
    }

    try {
      await api.put(`/requests/${selectedRequest._id}/status`, {
        status: 'approved',
        adminNotes: approveData.adminNotes,
        estimatedCost: Number(approveData.estimatedCost)
      });
      toast.success('Request approved successfully!');
      setShowApproveModal(false);
      setApproveData({ adminNotes: '', estimatedCost: '' });
      fetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async () => {
    if (!rejectNotes) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await api.put(`/requests/${selectedRequest._id}/status`, {
        status: 'rejected',
        adminNotes: rejectNotes
      });
      toast.success('Request rejected');
      setShowRejectModal(false);
      setRejectNotes('');
      fetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handlePriorityUpdate = async (requestId, newPriority) => {
    try {
      await api.put(`/requests/${requestId}`, { priority: newPriority });
      toast.success('Priority updated!');
      fetchRequests();
    } catch (error) {
      console.error('Error updating priority:', error);
      toast.error('Failed to update priority');
    }
  };

  const handleDelete = async (requestId) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await api.delete(`/requests/${requestId}`);
      toast.success('Request deleted');
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error('Failed to delete request');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-gray-100 text-gray-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Request Management</h1>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Request Management</h1>

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
                  {typeOptions.map(type => (
                    <option key={type} value={type}>{typeNames[type]}</option>
                  ))}
                </select>
                <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="input-field">
                  <option value="all">All Priorities</option>
                  {priorityOptions.map(priority => (
                    <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : requests.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <p className="text-gray-500">No requests found</p>
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {requests.map((request) => (
                        <tr key={request._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{request.userId?.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{request.userId?.email || ''}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-2xl">{typeIcons[request.requestType]}</span>
                          </td>
                          <td className="px-6 py-4 font-medium">{request.title}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={request.priority}
                              onChange={(e) => handlePriorityUpdate(request._id, e.target.value)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}
                            >
                              {priorityOptions.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <Eye className="h-5 w-5 inline" />
                            </button>
                            {request.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowApproveModal(true);
                                  }}
                                  className="text-green-600 hover:text-green-800"
                                >
                                  <CheckCircle className="h-5 w-5 inline" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setShowRejectModal(true);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <XCircle className="h-5 w-5 inline" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {requests.map((request) => (
                    <div key={request._id} className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-start space-x-3 mb-3">
                        <span className="text-3xl">{typeIcons[request.requestType]}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{request.title}</h3>
                          <p className="text-sm text-gray-600">{request.userId?.name}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mb-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailsModal(true);
                          }}
                          className="flex-1 btn-secondary text-sm"
                        >
                          View
                        </button>
                        {request.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowApproveModal(true);
                              }}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              Reject
                            </button>
                          </>
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

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDetailsModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Request Details</h2>
                <button onClick={() => setShowDetailsModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">{typeIcons[selectedRequest.requestType]}</span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedRequest.title}</h3>
                    <p className="text-gray-600">{typeNames[selectedRequest.requestType]}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Priority</p>
                    <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                      {selectedRequest.priority}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">User Information</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedRequest.userId?.name}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedRequest.userId?.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedRequest.contactNumber}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold mb-2">Description</h4>
                  <p className="bg-gray-50 rounded-lg p-4">{selectedRequest.description}</p>
                </div>

                {selectedRequest.location && (
                  <div>
                    <h4 className="font-bold mb-2">Location</h4>
                    <p className="bg-gray-50 rounded-lg p-4">{selectedRequest.location}</p>
                  </div>
                )}

                {selectedRequest.preferredDate && (
                  <div>
                    <p className="text-sm text-gray-600">Preferred Date</p>
                    <p className="font-medium">{new Date(selectedRequest.preferredDate).toLocaleDateString()}</p>
                  </div>
                )}

                {selectedRequest.images && selectedRequest.images.length > 0 && (
                  <div>
                    <h4 className="font-bold mb-2">Images</h4>
                    <div className="grid grid-cols-3 gap-4">
                      {selectedRequest.images.map((img, index) => (
                        <img 
                          key={index} 
                          src={img.startsWith('http') ? img : `http://localhost:5000${img}`} 
                          alt={`Request ${index + 1}`} 
                          className="rounded-lg object-cover h-32 w-full cursor-pointer hover:opacity-75 transition-opacity"
                          onClick={() => window.open(img.startsWith('http') ? img : `http://localhost:5000${img}`, '_blank')}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                            e.target.onerror = null;
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {selectedRequest.estimatedCost && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Estimated Cost</p>
                    <p className="text-2xl font-bold text-primary-600">₹{selectedRequest.estimatedCost}</p>
                  </div>
                )}

                {selectedRequest.adminNotes && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-bold mb-2 text-blue-900">Admin Notes</h4>
                    <p>{selectedRequest.adminNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showApproveModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowApproveModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Approve Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Cost *</label>
                <input
                  type="number"
                  value={approveData.estimatedCost}
                  onChange={(e) => setApproveData({ ...approveData, estimatedCost: e.target.value })}
                  className="input-field"
                  placeholder="Enter estimated cost"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Admin Notes *</label>
                <textarea
                  value={approveData.adminNotes}
                  onChange={(e) => setApproveData({ ...approveData, adminNotes: e.target.value })}
                  rows="4"
                  className="input-field"
                  placeholder="Add notes for approval..."
                />
              </div>
              <div className="flex space-x-3">
                <button onClick={handleApprove} className="flex-1 btn-primary">Approve</button>
                <button onClick={() => setShowApproveModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {showRejectModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowRejectModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4">Reject Request</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Rejection *</label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  rows="4"
                  className="input-field"
                  placeholder="Please provide a reason..."
                />
              </div>
              <div className="flex space-x-3">
                <button onClick={handleReject} className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700">Reject</button>
                <button onClick={() => setShowRejectModal(false)} className="flex-1 btn-secondary">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
