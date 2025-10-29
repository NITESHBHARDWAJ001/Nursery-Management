import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Leaf, 
  Package, 
  Warehouse, 
  BarChart3, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  ChevronLeft,
  Store,
  FileDown,
  Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminSidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/plants', icon: Leaf, label: 'Plant Management' },
    { path: '/admin/orders', icon: Package, label: 'Order Management' },
    { path: '/admin/stock', icon: Warehouse, label: 'Stock Management' },
    { path: '/admin/shop-sale', icon: Store, label: 'Shop Sale' },
    { path: '/admin/shop-sales-export', icon: FileDown, label: 'Export Sales' },
    { path: '/admin/reviews', icon: Star, label: 'Review Management' },
    { path: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' },
    { path: '/admin/requests', icon: FileText, label: 'Request Management' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Link to="/admin" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-900">Green Haven</h1>
                <p className="text-xs text-gray-600">Admin Panel</p>
              </div>
            )}
          </Link>
          
          {/* Desktop Collapse Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className={`h-5 w-5 text-gray-600 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all group ${
                active
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
              }`}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-white' : 'text-gray-500 group-hover:text-primary-600'}`} />
              {!isCollapsed && (
                <span className="font-medium truncate">{item.label}</span>
              )}
              {active && !isCollapsed && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-white shadow-2xl z-50 lg:hidden flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-gray-200 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default AdminSidebar;
