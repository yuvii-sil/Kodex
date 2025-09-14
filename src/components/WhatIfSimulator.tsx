import React, { useState, useEffect } from 'react';
import { Activity, Sliders, BarChart3, AlertTriangle, TrendingDown, Users } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export function WhatIfSimulator() {
  const { personnel } = useData();
  const [unavailableCount, setUnavailableCount] = useState(0);
  const [unavailableRole, setUnavailableRole] = useState('');
  const [simulationResults, setSimulationResults] = useState<any>(null);

  const roles = [...new Set(personnel.map(p => p.role))];
  const maxUnavailable = Math.floor(personnel.length * 0.5); // Max 50% can be simulated as unavailable

  useEffect(() => {
    runSimulation();
  }, [unavailableCount, unavailableRole, personnel]);

  const runSimulation = () => {
    let simulatedPersonnel = [...personnel];
    
    // Apply simulation parameters
    if (unavailableCount > 0) {
      let candidates = unavailableRole 
        ? simulatedPersonnel.filter(p => p.role === unavailableRole && p.availability === 'Available')
        : simulatedPersonnel.filter(p => p.availability === 'Available');
      
      // Sort by readiness (take the most ready ones offline to show maximum impact)
      candidates.sort((a, b) => b.readiness - a.readiness);
      
      const toMakeUnavailable = candidates.slice(0, Math.min(unavailableCount, candidates.length));
      
      simulatedPersonnel = simulatedPersonnel.map(person => 
        toMakeUnavailable.find(p => p.id === person.id)
          ? { ...person, availability: 'Simulated Unavailable' as any }
          : person
      );
    }

    // Calculate impact metrics
    const originalReadiness = personnel.reduce((sum, p) => sum + p.readiness, 0) / personnel.length;
    const availablePersonnel = simulatedPersonnel.filter(p => p.availability === 'Available');
    const newReadiness = availablePersonnel.length > 0 
      ? availablePersonnel.reduce((sum, p) => sum + p.readiness, 0) / availablePersonnel.length 
      : 0;
    
    const readinessImpact = originalReadiness - newReadiness;
    const capacityImpact = ((personnel.filter(p => p.availability === 'Available').length - availablePersonnel.length) / personnel.length) * 100;
    
    // Role-specific impact
    const roleImpact = roles.map(role => {
      const originalCount = personnel.filter(p => p.role === role && p.availability === 'Available').length;
      const newCount = simulatedPersonnel.filter(p => p.role === role && p.availability === 'Available').length;
      const impact = originalCount > 0 ? ((originalCount - newCount) / originalCount) * 100 : 0;
      
      return {
        role,
        originalCount,
        newCount,
        impact: Math.round(impact),
        critical: impact > 50
      };
    });

    // Mission capability assessment
    const criticalRoles = ['Pilot', 'Medic', 'Engineer'];
    const missionImpact = criticalRoles.map(role => {
      const available = simulatedPersonnel.filter(p => p.role === role && p.availability === 'Available').length;
      const total = personnel.filter(p => p.role === role).length;
      const capability = total > 0 ? Math.round((available / total) * 100) : 100;
      
      return {
        role,
        available,
        total,
        capability,
        status: capability >= 75 ? 'Operational' : capability >= 50 ? 'Limited' : 'Critical'
      };
    });

    setSimulationResults({
      originalReadiness: Math.round(originalReadiness),
      newReadiness: Math.round(newReadiness),
      readinessImpact: Math.round(readinessImpact),
      capacityImpact: Math.round(capacityImpact),
      roleImpact,
      missionImpact,
      affectedPersonnel: unavailableCount,
      remainingCapable: availablePersonnel.length
    });
  };

  const chartData = simulationResults ? {
    labels: roles,
    datasets: [
      {
        label: 'Original Available',
        data: simulationResults.roleImpact.map((r: any) => r.originalCount),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'After Simulation',
        data: simulationResults.roleImpact.map((r: any) => r.newCount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Personnel Availability by Role'
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
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">What-If Scenario Simulator</h2>
          <p className="text-gray-600">Model the impact of personnel unavailability on unit readiness</p>
        </div>
        <Activity className="h-8 w-8 text-blue-600" />
      </div>

      {/* Simulation Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Sliders className="h-5 w-5 mr-2" />
          Simulation Parameters
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Number of Personnel Unavailable: {unavailableCount}
            </label>
            <input
              type="range"
              min="0"
              max={maxUnavailable}
              value={unavailableCount}
              onChange={(e) => setUnavailableCount(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{Math.floor(maxUnavailable / 2)}</span>
              <span>{maxUnavailable}</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Specific Role (Optional)
            </label>
            <select
              value={unavailableRole}
              onChange={(e) => setUnavailableRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              {roles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Dashboard */}
      {simulationResults && (
        <>
          {/* Impact Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Readiness Impact</p>
                  <p className={`text-2xl font-bold ${simulationResults.readinessImpact > 10 ? 'text-red-600' : simulationResults.readinessImpact > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                    -{simulationResults.readinessImpact}%
                  </p>
                </div>
                <TrendingDown className={`h-6 w-6 ${simulationResults.readinessImpact > 10 ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Capacity Loss</p>
                  <p className={`text-2xl font-bold ${simulationResults.capacityImpact > 25 ? 'text-red-600' : simulationResults.capacityImpact > 15 ? 'text-yellow-600' : 'text-green-600'}`}>
                    -{simulationResults.capacityImpact}%
                  </p>
                </div>
                <Users className={`h-6 w-6 ${simulationResults.capacityImpact > 25 ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Affected Personnel</p>
                  <p className="text-2xl font-bold text-gray-900">{simulationResults.affectedPersonnel}</p>
                </div>
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Remaining Capable</p>
                  <p className="text-2xl font-bold text-blue-600">{simulationResults.remainingCapable}</p>
                </div>
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Role Impact Chart */}
          {chartData && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personnel Impact by Role</h3>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Mission Capability Assessment */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission Capability Assessment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {simulationResults.missionImpact.map((mission: any) => (
                <div key={mission.role} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{mission.role}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      mission.status === 'Operational' ? 'bg-green-100 text-green-800' :
                      mission.status === 'Limited' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {mission.status}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">{mission.available}/{mission.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          mission.capability >= 75 ? 'bg-green-500' :
                          mission.capability >= 50 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${mission.capability}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500">
                      {mission.capability}% capability maintained
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts */}
          {(simulationResults.readinessImpact > 15 || simulationResults.capacityImpact > 30) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
                <div>
                  <h3 className="text-red-800 font-medium">Critical Impact Detected</h3>
                  <p className="text-red-700 text-sm mt-1">
                    This scenario would result in significant operational degradation. Consider:
                  </p>
                  <ul className="list-disc list-inside text-red-700 text-sm mt-2 space-y-1">
                    <li>Implementing backup personnel plans</li>
                    <li>Cross-training programs for critical roles</li>
                    <li>Emergency response protocols</li>
                    <li>Reserve personnel activation procedures</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}