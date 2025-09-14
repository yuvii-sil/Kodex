import React, { useState } from 'react';
import { 
  Home, Users, Target, TrendingUp, Settings, 
  Menu, X, LogOut, Shield, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
}

export function Layout({ children, currentPage, onPageChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, hasPermission } = useAuth();
  const { addActivityLog } = useData();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, permission: 'dashboard' },
    { id: 'personnel', label: 'Personnel', icon: Users, permission: 'personnel' },
    { id: 'missions', label: 'Mission Assignment', icon: Target, permission: 'missions' },
    { id: 'insights', label: 'Predictive Insights', icon: TrendingUp, permission: 'insights' },
    { id: 'simulator', label: 'What-If Simulator', icon: Activity, permission: 'simulator' },
    { id: 'logs', label: 'Activity Logs', icon: Shield, permission: 'logs' },
    { id: 'settings', label: 'Settings', icon: Settings, permission: 'settings' }
  ];

  const handlePageChange = (page: string) => {
    if (hasPermission(page)) {
      onPageChange(page);
      addActivityLog('Navigation', `Accessed ${page} page`);
      setSidebarOpen(false);
    }
  };

  const handleLogout = () => {
    addActivityLog('Authentication', 'User logged out');
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-900 transform ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-blue-800">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-200 mr-3" />
              <span className="text-white font-bold text-lg">IAF HMS</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-blue-200 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User info */}
          <div className="px-6 py-4 border-b border-blue-800">
            <div className="text-white font-medium">{user?.name}</div>
            <div className="text-blue-300 text-sm">{user?.role}</div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {menuItems.map((item) => {
              const isActive = currentPage === item.id;
              const hasAccess = hasPermission(item.permission);
              
              if (!hasAccess && user?.role !== 'Commander') return null;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handlePageChange(item.id)}
                  disabled={!hasAccess}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-800 text-white'
                      : hasAccess
                        ? 'text-blue-200 hover:bg-blue-800 hover:text-white'
                        : 'text-blue-400 cursor-not-allowed opacity-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-blue-800">
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-blue-200 hover:bg-blue-800 hover:text-white rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="bg-white shadow-sm border-b">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {currentPage.replace(/([A-Z])/g, ' $1').trim()}
              </h1>
              
              <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                  <div className="text-sm font-medium text-gray-900">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}