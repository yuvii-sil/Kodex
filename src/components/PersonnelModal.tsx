import React from 'react';
import { X, Phone, Mail, MapPin, Calendar, Shield, Activity, BookOpen, AlertTriangle } from 'lucide-react';
import { Personnel } from '../types';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

interface PersonnelModalProps {
  person: Personnel;
  onClose: () => void;
}

export function PersonnelModal({ person, onClose }: PersonnelModalProps) {
  const { hasPermission } = useAuth();

  const getAIRecommendation = (person: Personnel): string => {
    if (person.trainingScore < 70) {
      return `Immediate training required. Schedule refresher course within 30 days.`;
    }
    if (person.healthScore < 75) {
      return `Health assessment recommended. Consider fitness improvement program.`;
    }
    if (person.readiness < 80) {
      return `Overall readiness below optimal. Review training and health metrics.`;
    }
    if (new Date(person.lastTrainingDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
      return `Training update due soon. Schedule within 60 days to maintain proficiency.`;
    }
    return `Personnel performing well. Continue current training schedule.`;
  };

  const getRecommendationColor = (person: Personnel): string => {
    if (person.trainingScore < 70 || person.healthScore < 75 || person.readiness < 80) {
      return 'bg-red-50 border-red-200 text-red-800';
    }
    if (new Date(person.lastTrainingDate) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) {
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
    return 'bg-green-50 border-green-200 text-green-800';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={onClose} />
        
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{person.name}</h2>
              <p className="text-gray-600">{person.rank} • {person.role}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">ID:</span>
                      <span className="ml-2 text-sm font-medium">{person.id}</span>
                    </div>
                    
                    {person.location && (
                      <div className="flex items-center">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="ml-2 text-sm font-medium">{person.location}</span>
                      </div>
                    )}
                    
                    {person.phoneNumber && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Phone:</span>
                        <span className="ml-2 text-sm font-medium">{person.phoneNumber}</span>
                      </div>
                    )}
                    
                    {person.email && (
                      <div className="flex items-center">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <span className="text-sm text-gray-600">Email:</span>
                        <span className="ml-2 text-sm font-medium">{person.email}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                      <span className="text-sm text-gray-600">Years of Service:</span>
                      <span className="ml-2 text-sm font-medium">{person.yearsOfService} years</span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Skills & Specializations</h3>
                  <div className="flex flex-wrap gap-2">
                    {person.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Medical Restrictions */}
                {hasPermission('medical-details') && person.medicalRestrictions.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Restrictions</h3>
                    <div className="space-y-2">
                      {person.medicalRestrictions.map((restriction, index) => (
                        <div key={index} className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                          <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-sm text-red-800">{restriction}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Performance Metrics */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Overall Readiness</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${person.readiness}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{person.readiness}%</span>
                      </div>
                    </div>

                    {hasPermission('health-scores') && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${person.healthScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{person.healthScore}%</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Training Score</span>
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${person.trainingScore}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{person.trainingScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Status</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Availability:</span>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        person.availability === 'Available' ? 'bg-green-100 text-green-800' :
                        person.availability === 'Deployed' ? 'bg-blue-100 text-blue-800' :
                        person.availability === 'Leave' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {person.availability}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Deployment Status:</span>
                      <span className="text-sm font-medium">{person.deploymentStatus}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Last Training:</span>
                      <span className="text-sm font-medium">
                        {format(new Date(person.lastTrainingDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendation */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">AI Recommendation</h3>
              <div className={`p-4 rounded-lg border ${getRecommendationColor(person)}`}>
                <div className="flex items-start">
                  <BookOpen className="h-5 w-5 mr-3 mt-0.5" />
                  <p className="text-sm">{getAIRecommendation(person)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}