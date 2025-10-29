import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye, MapPin, Calendar } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const MyRequests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchRequests();
  }, [user]);

  const fetchRequests = async () => {
    try {
      const response = await api.get('/requests/user');
      setRequests(response.data.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load requests');
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'in-progress':
        return <AlertCircle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'onsitePlantation':
        return '🏡';
      case 'newVariety':
        return '🌱';
      case 'customOrder':
        return '📦';
      case 'consultation':
        return '💡';
      default:
        return '📝';
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case 'onsitePlantation':
        return 'Onsite Plantation';
      case 'newVariety':
        return 'New Variety';
      case 'customOrder':
        return 'Custom Order';
      case 'consultation':
        return 'Consultation';
      default:
        return type;
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Requests</h1>
            <p className="text-gray-600">Track your service requests and inquiries</p>
          </div>

          <button
            onClick={() => navigate('/request')}
            className="mt-4 sm:mt-0 btn-primary flex items-center space-x-2"
          >
            <Plus className="h-5 w-5" />
            <span>New Request</span>
          </button>
        </div>

        {requests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="flex justify-center mb-6">
              <div className="p-6 bg-white rounded-full shadow-lg">
                <FileText className="h-24 w-24 text-gray-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No requests yet</h2>
            <p className="text-gray-600 mb-8">
              Submit your first request for custom services or plant varieties
            </p>
            <button
              onClick={() => navigate('/request')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Submit Request</span>
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-3xl">{getTypeIcon(request.requestType)}</span>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">
                          {getTypeName(request.requestType)}
                        </p>
                        <div className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          <span>{request.priority} priority</span>
                        </div>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      <span className="capitalize">{request.status}</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                    {request.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {request.description}
                  </p>

                  <div className="space-y-2 mb-4 text-xs text-gray-500">
                    {request.preferredDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(request.preferredDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                    {request.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{request.location}</span>
                      </div>
                    )}
                  </div>

                  {request.estimatedCost && (
                    <div className="mb-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-green-700 font-medium">Estimated Cost</p>
                      <p className="text-xl font-bold text-green-900">₹{request.estimatedCost}</p>
                    </div>
                  )}

                  {request.adminNotes && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium mb-1">Admin Response</p>
                      <p className="text-sm text-blue-900">{request.adminNotes}</p>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="w-full btn-secondary flex items-center justify-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 mt-3">
                    Submitted {new Date(request.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedRequest && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedRequest(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-4xl">{getTypeIcon(selectedRequest.requestType)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{selectedRequest.title}</h2>
                      <p className="text-sm text-gray-600">{getTypeName(selectedRequest.requestType)}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => setSelectedRequest(null)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="flex items-center space-x-3 mb-6">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {getStatusIcon(selectedRequest.status)}
                  <span className="font-medium capitalize">{selectedRequest.status}</span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedRequest.priority)}`}>
                  {selectedRequest.priority} priority
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-lg mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {selectedRequest.preferredDate && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Preferred Date</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedRequest.preferredDate).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                )}

                {selectedRequest.location && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.location}</p>
                  </div>
                )}

                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Contact Number</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.contactNumber}</p>
                </div>

                {selectedRequest.estimatedCost && (
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 mb-1">Estimated Cost</p>
                    <p className="text-2xl font-bold text-green-900">₹{selectedRequest.estimatedCost}</p>
                  </div>
                )}
              </div>

              {selectedRequest.adminNotes && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Admin Response</h3>
                  <p className="text-blue-800">{selectedRequest.adminNotes}</p>
                  {selectedRequest.responseDate && (
                    <p className="text-xs text-blue-600 mt-2">
                      Responded on {new Date(selectedRequest.responseDate).toLocaleDateString('en-IN')}
                    </p>
                  )}
                </div>
              )}

              {selectedRequest.images && selectedRequest.images.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Attached Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {selectedRequest.images.map((image, index) => (
                      <img
                        key={index}
                        src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                        alt={`Request image ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-75 transition-opacity"
                        onClick={() => window.open(image.startsWith('http') ? image : `http://localhost:5000${image}`, '_blank')}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/150?text=Image+Not+Found';
                          e.target.onerror = null;
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 text-xs text-gray-500">
                <p>Submitted on {new Date(selectedRequest.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default MyRequests;
