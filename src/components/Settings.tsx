import React from 'react';
import { Settings as SettingsIcon, Database, Bell, Shield, Download, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export function Settings() {
  const { simulateRealTimeUpdates, setSimulateRealTimeUpdates, personnel } = useData();
  const { user } = useAuth();

  const handleDataBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      personnel: personnel,
      version: '1.0.0'
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `iaf-backup-${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-600">Configure system preferences and data management</p>
        </div>
        <SettingsIcon className="h-8 w-8 text-blue-600" />
      </div>

      {/* Real-time Updates */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Simulation</h3>
            <p className="text-gray-600">Enable automatic updates to personnel data every 30 seconds</p>
          </div>
          <button
            onClick={() => setSimulateRealTimeUpdates(!simulateRealTimeUpdates)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              simulateRealTimeUpdates ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              simulateRealTimeUpdates ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Database className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Data Backup</h4>
              <p className="text-sm text-gray-600">Export current personnel data as JSON backup</p>
            </div>
            <button
              onClick={handleDataBackup}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Backup
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Current Dataset</h4>
              <p className="text-sm text-gray-600">{personnel.length} personnel records loaded</p>
            </div>
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Shield className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Security & Access</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Current User</h4>
              <p className="text-sm text-gray-600">{user?.name} ({user?.role})</p>
            </div>
            <div className="text-sm text-green-600 font-medium">Active</div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-900">Access Level</h4>
              <p className="text-sm text-gray-600">
                {user?.role === 'Commander' ? 'Full system access' : 
                 user?.role === 'HR' ? 'Personnel and training data' :
                 'Medical and health data only'}
              </p>
            </div>
            <div className={`px-2 py-1 text-xs font-semibold rounded-full ${
              user?.role === 'Commander' ? 'bg-red-100 text-red-800' :
              user?.role === 'HR' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {user?.role}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-gray-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Notification Preferences</h3>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Critical Alerts</h4>
              <p className="text-sm text-gray-600">Readiness drops below 75%</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Training Reminders</h4>
              <p className="text-sm text-gray-600">Personnel need training updates</p>
            </div>
            <input type="checkbox" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Health Alerts</h4>
              <p className="text-sm text-gray-600">Health scores below optimal</p>
            </div>
            <input type="checkbox" defaultChecked={user?.role !== 'HR'} disabled={user?.role === 'HR'} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Version:</span>
            <span className="ml-2 text-gray-600">IAF HMS v1.0.0</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Database:</span>
            <span className="ml-2 text-gray-600">In-Memory (Demo)</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Last Backup:</span>
            <span className="ml-2 text-gray-600">Manual only</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Environment:</span>
            <span className="ml-2 text-gray-600">Development</span>
          </div>
        </div>
      </div>
    </div>
  );
}