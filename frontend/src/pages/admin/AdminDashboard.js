import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Menu, TrendingUp, Package, Users, Leaf, AlertTriangle, Clock, DollarSign } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import AdminSidebar from '../../components/AdminSidebar';
import toast from 'react-hot-toast';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    monthlySales: 0,
    monthlyOrders: 0,
    totalCustomers: 0,
    totalPlants: 0,
    lowStockCount: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [topPlants, setTopPlants] = useState([]);
  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/reports/dashboard');
      const data = response.data.data;
      
      setStats({
        todaySales: data.todaySales || 0,
        todayOrders: data.todayOrders || 0,
        monthlySales: data.monthlySales || 0,
        monthlyOrders: data.monthlyOrders || 0,
        totalCustomers: data.totalCustomers || 0,
        totalPlants: data.totalPlants || 0,
        lowStockCount: data.lowStockCount || 0,
        pendingOrders: data.pendingOrders || 0
      });

      setRecentOrders(data.recentOrders || []);
      setTopPlants(data.topPlants || []);
      setSalesData(data.salesTrend || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Monthly Sales',
      value: `₹${stats.monthlySales.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: '+12%'
    },
    {
      title: 'Monthly Orders',
      value: stats.monthlyOrders,
      icon: Package,
      color: 'bg-blue-500',
      trend: '+8%'
    },
    {
      title: 'Total Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Plants',
      value: stats.totalPlants,
      icon: Leaf,
      color: 'bg-green-600'
    },
    {
      title: 'Low Stock Items',
      value: stats.lowStockCount,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      alert: stats.lowStockCount > 0
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-yellow-500',
      alert: stats.pendingOrders > 0
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Menu className="h-6 w-6 text-gray-600" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
              <p className="text-gray-600">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                        <p className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</p>
                        {stat.trend && (
                          <p className="text-sm text-green-600 font-medium flex items-center">
                            <TrendingUp className="h-4 w-4 mr-1" />
                            {stat.trend} from last month
                          </p>
                        )}
                        {stat.alert && (
                          <p className="text-sm text-orange-600 font-medium">
                            Requires attention
                          </p>
                        )}
                      </div>
                      <div className={`${stat.color} p-3 rounded-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-md p-6 mb-8"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sales Trend</h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }} 
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#15803d" 
                      strokeWidth={2}
                      dot={{ fill: '#15803d', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Selling Plants */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Top Selling Plants</h2>
                <div className="space-y-4">
                  {topPlants.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No data available</p>
                  ) : (
                    topPlants.slice(0, 5).map((plant, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{plant.name}</p>
                          <p className="text-sm text-gray-600">{plant.soldCount} units sold</p>
                        </div>
                        <p className="font-bold text-primary-600">₹{plant.revenue?.toLocaleString()}</p>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>

              {/* Recent Orders */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Orders</h2>
                <div className="space-y-4">
                  {recentOrders.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No recent orders</p>
                  ) : (
                    recentOrders.slice(0, 5).map((order, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{order.orderId}</p>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">₹{order.totalAmount}</p>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            order.orderStatus === 'delivered' ? 'bg-green-100 text-green-800' :
                            order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {order.orderStatus}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
