import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, Download, TrendingUp, DollarSign, ShoppingCart, Package, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const ReportsAnalytics = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [pastReports, setPastReports] = useState([]);

  const COLORS = ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac'];

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchPastReports();
  }, []);

  const fetchPastReports = async () => {
    try {
      const response = await api.get('/reports/all');
      setPastReports(response.data.data || []);
    } catch (error) {
      console.error('Error fetching past reports:', error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      const monthName = months[selectedMonth - 1]; // Convert number to month name
      const response = await api.post('/reports/generate', {
        month: monthName,
        year: selectedYear
      });
      
      setReportData(response.data.data);
      toast.success('Report generated successfully!');
      fetchPastReports();
      setLoading(false);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/reports/export?type=${type}&month=${selectedMonth}&year=${selectedYear}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${selectedMonth}-${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success(`${type} exported successfully!`);
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Failed to export data');
    }
  };

  const formatCurrency = (value) => `₹${value?.toLocaleString() || 0}`;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Reports & Analytics</h1>
            <button onClick={() => setIsMobileOpen(true)} className="p-2 rounded-lg hover:bg-gray-100">
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Reports & Analytics</h1>

            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Period</label>
                  <div className="grid grid-cols-2 gap-4">
                    <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="input-field">
                      {months.map((month, index) => (
                        <option key={index} value={index + 1}>{month}</option>
                      ))}
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="input-field">
                      {[2024, 2025, 2026].map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="md:col-span-2 flex items-end space-x-2">
                  <button onClick={handleGenerateReport} disabled={loading} className="flex-1 btn-primary disabled:opacity-50">
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                  <button onClick={() => handleExport('orders')} className="btn-secondary px-4">
                    <Download className="h-5 w-5" />
                  </button>
                  <button onClick={() => handleExport('inventory')} className="btn-secondary px-4">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {reportData ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.summary?.totalSales)}</p>
                      </div>
                      <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{reportData.summary?.totalOrders || 0}</p>
                      </div>
                      <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Profit</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.summary?.totalProfit)}</p>
                      </div>
                      <div className="h-12 w-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                        <p className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.summary?.totalExpenses)}</p>
                      </div>
                      <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                        <Package className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Sales Trend</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.salesTrend || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Line type="monotone" dataKey="sales" stroke="#15803d" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue by Week</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.weeklyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="week" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar dataKey="revenue" fill="#16a34a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {reportData.categoryDistribution && reportData.categoryDistribution.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Category Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={reportData.categoryDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {reportData.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Top Selling Plants</h3>
                    <div className="space-y-3">
                      {(reportData.topSellingPlants || []).slice(0, 5).map((plant, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="font-bold text-gray-500 text-lg">#{index + 1}</span>
                            <div>
                              <p className="font-medium text-gray-900">{plant.name}</p>
                              <p className="text-sm text-gray-600">{plant.unitsSold} units sold</p>
                            </div>
                          </div>
                          <p className="font-semibold text-primary-600">{formatCurrency(plant.revenue)}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Low Stock Items</h3>
                    <div className="space-y-3">
                      {(reportData.lowStockItems || []).slice(0, 5).map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{item.name}</p>
                            <p className="text-sm text-gray-600">Threshold: {item.threshold} units</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-red-600">{item.currentQuantity} units</p>
                            <span className="inline-flex items-center text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {reportData.forecast && reportData.forecast.length > 0 && (
                  <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">3-Month Forecast</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Predicted Sales</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Predicted Orders</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Confidence</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {reportData.forecast.map((item, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-medium">{item.month}</td>
                              <td className="px-6 py-4 text-right font-semibold text-primary-600">
                                {formatCurrency(item.predictedSales)}
                              </td>
                              <td className="px-6 py-4 text-right">{item.predictedOrders}</td>
                              <td className="px-6 py-4 text-right">
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                                  {item.confidence}%
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-md p-16 text-center">
                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No report generated yet</p>
                <p className="text-sm text-gray-400">Select a period and click "Generate Report" to view analytics</p>
              </div>
            )}

            {pastReports.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Past Reports</h3>
                <div className="space-y-2">
                  {pastReports.slice(0, 12).map((report) => (
                    <button
                      key={report._id}
                      onClick={() => {
                        setSelectedMonth(report.month);
                        setSelectedYear(report.year);
                        setReportData(report);
                      }}
                      className="w-full text-left p-4 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">
                            {months[report.month - 1]} {report.year}
                          </p>
                          <p className="text-sm text-gray-600">
                            Generated on {new Date(report.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-600">
                            {formatCurrency(report.summary?.totalSales)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {report.summary?.totalOrders || 0} orders
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReportsAnalytics;
