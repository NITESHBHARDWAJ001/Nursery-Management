import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, TrendingUp, TrendingDown, AlertCircle, Package, FileText, Download } from 'lucide-react';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const StockManagement = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('all');
  const [plantFilter, setPlantFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    plantId: '',
    type: 'purchased',
    quantityChanged: '',
    costPerUnit: '',
    notes: ''
  });

  const transactionTypes = ['sold', 'purchased', 'adjustment', 'damaged', 'returned'];

  useEffect(() => {
    fetchTransactions();
    fetchPlants();
  }, [currentPage, typeFilter, plantFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 15,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(plantFilter !== 'all' && { plantId: plantFilter })
      });

      const response = await api.get(`/stock/transactions?${params}`);
      setTransactions(response.data.data || []);
      setTotalPages(response.data.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setLoading(false);
    }
  };

  const fetchPlants = async () => {
    try {
      const response = await api.get('/plants');
      setPlants(response.data.data || []);
    } catch (error) {
      console.error('Error fetching plants:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.plantId || !formData.quantityChanged) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.post('/stock/update', formData);
      toast.success('Stock updated successfully!');
      setFormData({
        plantId: '',
        type: 'purchased',
        quantityChanged: '',
        costPerUnit: '',
        notes: ''
      });
      fetchTransactions();
      fetchPlants();
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error(error.response?.data?.message || 'Failed to update stock');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      sold: 'bg-blue-100 text-blue-800',
      purchased: 'bg-green-100 text-green-800',
      adjustment: 'bg-yellow-100 text-yellow-800',
      damaged: 'bg-red-100 text-red-800',
      returned: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getTypeIcon = (type) => {
    if (type === 'purchased' || type === 'returned') return <TrendingUp className="h-4 w-4 inline" />;
    if (type === 'sold' || type === 'damaged') return <TrendingDown className="h-4 w-4 inline" />;
    return <AlertCircle className="h-4 w-4 inline" />;
  };

  const handleGeneratePurchaseOrder = async (format = 'pdf') => {
    try {
      const loadingToast = toast.loading(`Generating purchase order (${format.toUpperCase()})...`);
      const endpoint = format === 'pdf' ? '/stock/purchase-order' : '/stock/export-purchase-order';
      const response = await api.post(endpoint);
      
      toast.dismiss(loadingToast);
      toast.success('Purchase order generated successfully!');
      
      if (response.data.data?.downloadUrl) {
        const downloadUrl = `http://localhost:5000${response.data.data.downloadUrl}`;
        window.open(downloadUrl, '_blank');
        
        // Also trigger download
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = response.data.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error generating purchase order:', error);
      toast.error(error.response?.data?.message || 'Failed to generate purchase order');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Stock Management</h1>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 className="text-3xl font-bold text-gray-900">Stock Management</h1>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleGeneratePurchaseOrder('pdf')}
                  className="btn-primary flex items-center gap-2"
                >
                  <FileText className="h-5 w-5" />
                  Generate PO (PDF)
                </button>
                <button
                  onClick={() => handleGeneratePurchaseOrder('excel')}
                  className="btn-secondary flex items-center gap-2"
                >
                  <Download className="h-5 w-5" />
                  Export PO (Excel)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
                      <option value="all">All Types</option>
                      {transactionTypes.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                    <select value={plantFilter} onChange={(e) => setPlantFilter(e.target.value)} className="input-field md:col-span-2">
                      <option value="all">All Plants</option>
                      {plants.map(plant => (
                        <option key={plant._id} value={plant._id}>{plant.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-16 bg-white rounded-xl shadow-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-16 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions found</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-white rounded-xl shadow-md overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plant</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map((transaction) => (
                              <tr key={transaction._id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm">
                                  {new Date(transaction.date || transaction.createdAt).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td className="px-4 py-3 font-medium">{transaction.plant?.name || 'N/A'}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                    {getTypeIcon(transaction.type)} {transaction.type}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center font-semibold">
                                  {transaction.quantityChanged > 0 ? `+${transaction.quantityChanged}` : transaction.quantityChanged}
                                </td>
                                <td className="px-4 py-3 text-sm">
                                  {transaction.previousQuantity} → {transaction.newQuantity}
                                </td>
                                <td className="px-4 py-3 text-right font-semibold text-primary-600">
                                  ₹{transaction.totalCost?.toFixed(2) || '0.00'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
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

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Update Stock</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Plant *</label>
                      <select
                        value={formData.plantId}
                        onChange={(e) => setFormData({ ...formData, plantId: e.target.value })}
                        required
                        className="input-field"
                      >
                        <option value="">Select Plant</option>
                        {plants.map(plant => (
                          <option key={plant._id} value={plant._id}>
                            {plant.name} (Stock: {plant.quantityAvailable})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Transaction Type *</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        required
                        className="input-field"
                      >
                        {transactionTypes.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.quantityChanged}
                        onChange={(e) => setFormData({ ...formData, quantityChanged: e.target.value })}
                        required
                        className="input-field"
                        placeholder="Enter quantity"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cost Per Unit</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.costPerUnit}
                        onChange={(e) => setFormData({ ...formData, costPerUnit: e.target.value })}
                        className="input-field"
                        placeholder="Enter cost"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows="3"
                        className="input-field"
                        placeholder="Add notes..."
                      />
                    </div>

                    <button type="submit" className="w-full btn-primary">
                      Update Stock
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StockManagement;
