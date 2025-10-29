import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Edit2, Save, X, Leaf } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    country: user?.address?.country || 'India',
    preferredPlantType: user?.preferredPlantType || ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country
        },
        preferredPlantType: formData.preferredPlantType
      };

      await updateUserProfile(updateData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      phone: user?.phone || '',
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      zipCode: user?.address?.zipCode || '',
      country: user?.address?.country || 'India',
      preferredPlantType: user?.preferredPlantType || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-nature p-6 sm:p-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="h-10 w-10 text-primary-600" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-700">Manage your account information</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="hidden sm:flex items-center space-x-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Edit Button */}
          {!isEditing && (
            <div className="sm:hidden p-4 border-b border-gray-200">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full btn-primary flex items-center justify-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-6 sm:p-8">
            {!isEditing ? (
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{user?.name || 'Not provided'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 break-all">{user?.email}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{user?.phone || 'Not provided'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Preferred Plant Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{user?.preferredPlantType || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                    Address
                  </h2>
                  <div className="p-6 bg-gray-50 rounded-lg">
                    {user?.address && (user.address.street || user.address.city) ? (
                      <div className="space-y-2 text-gray-900">
                        {user.address.street && <p>{user.address.street}</p>}
                        <p>
                          {[user.address.city, user.address.state].filter(Boolean).join(', ')}
                        </p>
                        <p>
                          {[user.address.zipCode, user.address.country].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No address provided</p>
                    )}
                  </div>
                </div>

                {/* Account Stats */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Account Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-700 mb-1">Member Since</p>
                      <p className="font-semibold text-primary-900">
                        {new Date(user?.createdAt).toLocaleDateString('en-IN', {
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="p-4 bg-primary-50 rounded-lg">
                      <p className="text-sm text-primary-700 mb-1">Last Login</p>
                      <p className="font-semibold text-primary-900">
                        {user?.lastLogin 
                          ? new Date(user.lastLogin).toLocaleDateString('en-IN')
                          : 'Today'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <User className="h-5 w-5 mr-2 text-primary-600" />
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="input-field"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email (Cannot be changed)
                      </label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="input-field bg-gray-100 cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Leaf className="h-4 w-4 inline mr-1" />
                        Preferred Plant Type
                      </label>
                      <select
                        name="preferredPlantType"
                        value={formData.preferredPlantType}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select preference</option>
                        <option value="flowering">Flowering Plants</option>
                        <option value="indoor">Indoor Plants</option>
                        <option value="outdoor">Outdoor Plants</option>
                        <option value="bonsai">Bonsai</option>
                        <option value="succulent">Succulents</option>
                        <option value="herb">Herbs</option>
                        <option value="tree">Trees</option>
                        <option value="shrub">Shrubs</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-primary-600" />
                    Address
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter street address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter city"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter state"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter ZIP code"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Enter country"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="flex-1 btn-secondary flex items-center justify-center space-x-2"
                  >
                    <X className="h-5 w-5" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default UserProfile;
