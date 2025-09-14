import React from 'react';
import { Users, Shield, Activity, AlertTriangle, TrendingUp, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export function Dashboard() {
  const { personnel, alerts, simulateRealTimeUpdates, setSimulateRealTimeUpdates } = useData();
  const { hasPermission } = useAuth();

  const stats = {
    total: personnel.length,
    available: personnel.filter(p => p.availability === 'Available').length,
    deployed: personnel.filter(p => p.availability === 'Deployed').length,
    readiness: Math.round(personnel.reduce((sum, p) => sum + p.readiness, 0) / personnel.length),
    avgHealth: Math.round(personnel.reduce((sum, p) => sum + p.healthScore, 0) / personnel.length),
    avgTraining: Math.round(personnel.reduce((sum, p) => sum + p.trainingScore, 0) / personnel.length)
  };

  // Role distribution for pie chart
  const roleData = personnel.reduce((acc, person) => {
    acc[person.role] = (acc[person.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = {
    labels: Object.keys(roleData),
    datasets: [{
      data: Object.values(roleData),
      backgroundColor: [
        '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B',
        '#EF4444', '#06B6D4', '#84CC16', '#F97316'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  };

  // Training status for bar chart
  const trainingData = {
    labels: ['Excellent (90+)', 'Good (80-89)', 'Fair (70-79)', 'Needs Training (<70)'],
    datasets: [{
      label: 'Personnel Count',
      data: [
        personnel.filter(p => p.trainingScore >= 90).length,
        personnel.filter(p => p.trainingScore >= 80 && p.trainingScore < 90).length,
        personnel.filter(p => p.trainingScore >= 70 && p.trainingScore < 80).length,
        personnel.filter(p => p.trainingScore < 70).length
      ],
      backgroundColor: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'],
      borderRadius: 4
    }]
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className={`text-3xl font-bold ${color} mt-1`}>{value}</p>
          {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color.replace('text', 'bg').replace('gray-900', 'gray-100')}`}>
          <Icon className={`h-6 w-6 ${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Real-time toggle */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Real-Time Operations Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600">Real-time updates</span>
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

      {/* Alert Banner */}
      {alerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-red-800 font-medium">Active Alerts ({alerts.length})</h3>
              <p className="text-red-700 text-sm mt-1">
                {alerts.slice(0, 2).map(alert => alert.title).join(', ')}
                {alerts.length > 2 && ` and ${alerts.length - 2} more`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Personnel"
          value={stats.total}
          icon={Users}
          color="text-blue-600"
          subtitle={`${stats.available} available`}
        />
        
        <StatCard
          title="Unit Readiness"
          value={`${stats.readiness}%`}
          icon={Shield}
          color={stats.readiness >= 85 ? "text-green-600" : stats.readiness >= 70 ? "text-yellow-600" : "text-red-600"}
          subtitle="Overall capability"
        />
        
        {hasPermission('health-scores') && (
          <StatCard
            title="Avg Health Score"
            value={`${stats.avgHealth}%`}
            icon={Activity}
            color={stats.avgHealth >= 80 ? "text-green-600" : "text-yellow-600"}
            subtitle="Physical fitness"
          />
        )}
        
        <StatCard
          title="Avg Training"
          value={`${stats.avgTraining}%`}
          icon={TrendingUp}
          color={stats.avgTraining >= 80 ? "text-green-600" : "text-yellow-600"}
          subtitle="Skills proficiency"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnel by Role</h3>
          <div className="h-64">
            <Pie 
              data={pieData} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom' as const,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Training Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Status Distribution</h3>
          <div className="h-64">
            <Bar 
              data={trainingData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Deployment Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Deployment Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Available', count: stats.available, color: 'bg-green-100 text-green-800' },
            { label: 'Deployed', count: stats.deployed, color: 'bg-blue-100 text-blue-800' },
            { label: 'On Leave', count: personnel.filter(p => p.availability === 'Leave').length, color: 'bg-yellow-100 text-yellow-800' },
            { label: 'Medical', count: personnel.filter(p => p.availability === 'Medical').length, color: 'bg-red-100 text-red-800' }
          ].map((status) => (
            <div key={status.label} className="text-center p-4 rounded-lg border border-gray-200">
              <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${status.color} mb-2`}>
                {status.label}
              </div>
              <div className="text-2xl font-bold text-gray-900">{status.count}</div>
              <div className="text-sm text-gray-500">
                {Math.round((status.count / stats.total) * 100)}% of total
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}