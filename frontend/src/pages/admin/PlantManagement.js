import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Plus, Search, Edit2, Trash2, X, Upload } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const PlantManagement = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    name: '',
    category: 'indoor',
    description: '',
    price: '',
    quantityAvailable: '',
    lowStockThreshold: '10',
    careLevel: 'easy',
    sunlight: 'partial-sun',
    wateringFrequency: 'Once a week',
    height: '',
    growthTime: '',
    plantType: 'perennial',
    features: '',
    imageFile: null
  });

  const categories = ['flowering', 'indoor', 'outdoor', 'bonsai', 'succulent', 'herb', 'tree', 'shrub'];

  useEffect(() => {
    fetchPlants();
  }, [currentPage, searchTerm, categoryFilter]);

  const fetchPlants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== 'all' && { category: categoryFilter })
      });

      const response = await api.get(`/plants?${params}`);
      setPlants(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plants:', error);
      toast.error('Failed to load plants');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setFormData({ ...formData, imageFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'features') {
          const featuresArray = formData[key].split('\n').filter(f => f.trim());
          featuresArray.forEach(feature => {
            submitData.append('features', feature.trim());
          });
        } else if (key === 'imageFile' && formData[key]) {
          submitData.append('image', formData[key]);
        } else if (key !== 'imageFile') {
          submitData.append(key, formData[key]);
        }
      });

      if (isEditing && selectedPlant) {
        await api.put(`/plants/${selectedPlant._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Plant updated successfully!');
      } else {
        await api.post('/plants', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Plant created successfully!');
      }

      setShowModal(false);
      resetForm();
      fetchPlants();
    } catch (error) {
      console.error('Error saving plant:', error);
      toast.error(error.response?.data?.message || 'Failed to save plant');
    }
  };

  const handleEdit = (plant) => {
    setSelectedPlant(plant);
    setIsEditing(true);
    setFormData({
      name: plant.name,
      category: plant.category,
      description: plant.description,
      price: plant.price,
      quantityAvailable: plant.quantityAvailable,
      lowStockThreshold: plant.lowStockThreshold || 10,
      careLevel: plant.careLevel || 'easy',
      sunlight: plant.sunlight || 'partial-sun',
      wateringFrequency: plant.wateringFrequency || 'Once a week',
      height: plant.height || '',
      growthTime: plant.growthTime || '',
      plantType: plant.plantType || '',
      features: (plant.features || []).join('\n'),
      imageFile: null
    });
    setShowModal(true);
  };

  const handleDelete = async (plant) => {
    if (!window.confirm(`Are you sure you want to delete ${plant.name}?`)) return;

    try {
      await api.delete(`/plants/${plant._id}`);
      toast.success('Plant deleted successfully!');
      fetchPlants();
    } catch (error) {
      console.error('Error deleting plant:', error);
      toast.error('Failed to delete plant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'indoor',
      description: '',
      price: '',
      quantityAvailable: '',
      lowStockThreshold: '10',
      careLevel: 'easy',
      sunlight: 'partial-sun',
      wateringFrequency: 'Once a week',
      height: '',
      growthTime: '',
      plantType: 'perennial',
      features: '',
      imageFile: null
    });
    setIsEditing(false);
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Plant Management</h1>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4 sm:mb-0">Plant Management</h1>
              <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Add Plant</span>
              </button>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search plants..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 input-field"
                  />
                </div>
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field">
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
              </div>
            ) : plants.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <p className="text-gray-500 mb-4">No plants found</p>
                <button onClick={() => { resetForm(); setShowModal(true); }} className="btn-primary">Add Your First Plant</button>
              </div>
            ) : (
              <>
                <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {plants.map((plant) => (
                        <tr key={plant._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <img src={plant.imageUrl} alt={plant.name} className="h-12 w-12 object-cover rounded-lg" />
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">{plant.name}</td>
                          <td className="px-6 py-4 capitalize">{plant.category}</td>
                          <td className="px-6 py-4 font-semibold text-primary-600">₹{plant.price}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              plant.quantityAvailable === 0 ? 'bg-red-100 text-red-800' :
                              plant.quantityAvailable <= plant.lowStockThreshold ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {plant.quantityAvailable} units
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                            <button onClick={() => handleEdit(plant)} className="text-blue-600 hover:text-blue-800">
                              <Edit2 className="h-5 w-5 inline" />
                            </button>
                            <button onClick={() => handleDelete(plant)} className="text-red-600 hover:text-red-800">
                              <Trash2 className="h-5 w-5 inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-4">
                  {plants.map((plant) => (
                    <div key={plant._id} className="bg-white rounded-xl shadow-md p-4">
                      <div className="flex items-start space-x-4">
                        <img src={plant.imageUrl} alt={plant.name} className="h-20 w-20 object-cover rounded-lg" />
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900">{plant.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{plant.category}</p>
                          <p className="text-lg font-semibold text-primary-600 mt-1">₹{plant.price}</p>
                          <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                            plant.quantityAvailable === 0 ? 'bg-red-100 text-red-800' :
                            plant.quantityAvailable <= plant.lowStockThreshold ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {plant.quantityAvailable} units
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <button onClick={() => handleEdit(plant)} className="flex-1 btn-secondary text-sm">Edit</button>
                        <button onClick={() => handleDelete(plant)} className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 text-sm">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-700">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{isEditing ? 'Edit Plant' : 'Add New Plant'}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className="input-field">
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input type="number" name="quantityAvailable" value={formData.quantityAvailable} onChange={handleChange} required className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
                    <input type="number" name="lowStockThreshold" value={formData.lowStockThreshold} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Care Level</label>
                    <select name="careLevel" value={formData.careLevel} onChange={handleChange} className="input-field">
                      <option value="easy">Easy</option>
                      <option value="moderate">Moderate</option>
                      <option value="difficult">Difficult</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sunlight</label>
                    <select name="sunlight" value={formData.sunlight} onChange={handleChange} className="input-field">
                      <option value="full-sun">Full Sun</option>
                      <option value="partial-sun">Partial Sun</option>
                      <option value="shade">Shade</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Watering Frequency</label>
                    <input type="text" name="wateringFrequency" value={formData.wateringFrequency} onChange={handleChange} className="input-field" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="input-field" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features (one per line)</label>
                  <textarea name="features" value={formData.features} onChange={handleChange} rows="3" className="input-field" placeholder="Air purifying&#10;Low maintenance&#10;Pet friendly" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Plant Image</label>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="input-field" />
                  <p className="text-xs text-gray-500 mt-1">Max 5MB. JPG, PNG supported.</p>
                </div>

                <div className="flex space-x-4 pt-4">
                  <button type="submit" className="flex-1 btn-primary">
                    {isEditing ? 'Update Plant' : 'Add Plant'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary">Cancel</button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default PlantManagement;
