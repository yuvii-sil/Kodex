import React from 'react';
import { TrendingUp, AlertTriangle, Users, Target, Calendar, Shield } from 'lucide-react';
import { useData } from '../context/DataContext';
import { format, addMonths, addYears } from 'date-fns';

export function PredictiveInsights() {
  const { personnel, alerts } = useData();

  const generateInsights = () => {
    const insights = [];

    // Attrition Risk Analysis
    const seniorPersonnel = personnel.filter(p => p.yearsOfService >= 15);
    const attritionRisk = Math.round((seniorPersonnel.length / personnel.length) * 100);
    
    insights.push({
      id: 'attrition',
      type: attritionRisk > 30 ? 'critical' : attritionRisk > 20 ? 'warning' : 'info',
      title: 'Attrition Risk Analysis',
      description: `${attritionRisk}% of personnel have 15+ years service and may retire within 2 years`,
      impact: `Potential loss of ${seniorPersonnel.length} experienced personnel`,
      recommendation: 'Implement knowledge transfer programs and recruitment initiatives',
      timeline: '24 months',
      icon: Users
    });

    // Training Requirements Prediction
    const needsTraining = personnel.filter(p => p.trainingScore < 80);
    const trainingUrgent = needsTraining.filter(p => p.trainingScore < 70);
    
    insights.push({
      id: 'training',
      type: trainingUrgent.length > 3 ? 'critical' : needsTraining.length > 5 ? 'warning' : 'info',
      title: 'Training Requirements Forecast',
      description: `${needsTraining.length} personnel need training updates, ${trainingUrgent.length} urgently`,
      impact: `${Math.round((needsTraining.length / personnel.length) * 100)}% of force requires training intervention`,
      recommendation: 'Schedule immediate training for critical cases, plan quarterly updates for others',
      timeline: '3-6 months',
      icon: Target
    });

    // Health & Fitness Trends
    const healthRisk = personnel.filter(p => p.healthScore < 75);
    const avgHealthTrend = personnel.reduce((sum, p) => sum + p.healthScore, 0) / personnel.length;
    
    insights.push({
      id: 'health',
      type: healthRisk.length > 3 ? 'warning' : 'info',
      title: 'Health & Fitness Trends',
      description: `${healthRisk.length} personnel below optimal fitness levels`,
      impact: `Unit fitness average: ${Math.round(avgHealthTrend)}%`,
      recommendation: 'Implement unit-wide fitness improvement program',
      timeline: '6 months',
      icon: Shield
    });

    // Deployment Capacity Analysis
    const available = personnel.filter(p => p.availability === 'Available');
    const deploymentCapacity = Math.round((available.length / personnel.length) * 100);
    
    insights.push({
      id: 'deployment',
      type: deploymentCapacity < 60 ? 'critical' : deploymentCapacity < 75 ? 'warning' : 'info',
      title: 'Deployment Capacity Forecast',
      description: `${deploymentCapacity}% deployment capacity currently available`,
      impact: `${available.length} personnel ready for immediate deployment`,
      recommendation: deploymentCapacity < 60 ? 'Consider rotation schedule adjustments' : 'Maintain current deployment tempo',
      timeline: '1-3 months',
      icon: Calendar
    });

    // Skills Gap Analysis
    const criticalSkills = ['Night Ops', 'Emergency Medicine', 'Electronic Warfare'];
    const skillGaps = criticalSkills.map(skill => {
      const count = personnel.filter(p => p.skills.includes(skill)).length;
      return { skill, count, gap: count < 3 };
    });
    
    const hasSkillGaps = skillGaps.some(s => s.gap);
    
    insights.push({
      id: 'skills',
      type: hasSkillGaps ? 'warning' : 'info',
      title: 'Critical Skills Analysis',
      description: hasSkillGaps ? 'Shortages detected in critical skill areas' : 'Critical skills adequately covered',
      impact: skillGaps.filter(s => s.gap).map(s => `${s.skill}: ${s.count} qualified`).join(', '),
      recommendation: hasSkillGaps ? 'Prioritize training for critical skill gaps' : 'Continue skill development programs',
      timeline: '6-12 months',
      icon: TrendingUp
    });

    return insights;
  };

  const insights = generateInsights();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50';
      case 'warning': return 'border-yellow-200 bg-yellow-50';
      case 'info': return 'border-blue-200 bg-blue-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'info': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'critical': return 'Critical';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Predictive Insights</h2>
          <p className="text-gray-600">AI-driven analysis and forecasting for strategic planning</p>
        </div>
        <TrendingUp className="h-8 w-8 text-blue-600" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {['critical', 'warning', 'info'].map(type => {
          const count = insights.filter(i => i.type === type).length;
          return (
            <div key={type} className={`p-4 rounded-lg border ${getTypeColor(type)}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${getIconColor(type)}`}>
                    {getTypeLabel(type)} Issues
                  </p>
                  <p className={`text-2xl font-bold ${getIconColor(type)}`}>{count}</p>
                </div>
                <AlertTriangle className={`h-6 w-6 ${getIconColor(type)}`} />
              </div>
            </div>
          );
        })}
        
        <div className="p-4 rounded-lg border border-green-200 bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total Insights</p>
              <p className="text-2xl font-bold text-green-600">{insights.length}</p>
            </div>
            <Shield className="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {insights.map((insight) => (
          <div key={insight.id} className={`border-l-4 rounded-lg p-6 ${getTypeColor(insight.type)} ${
            insight.type === 'critical' ? 'border-l-red-500' : 
            insight.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
          }`}>
            <div className="flex items-start space-x-4">
              <div className={`p-2 rounded-lg ${insight.type === 'critical' ? 'bg-red-100' : 
                insight.type === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'}`}>
                <insight.icon className={`h-6 w-6 ${getIconColor(insight.type)}`} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    insight.type === 'critical' ? 'bg-red-100 text-red-800' :
                    insight.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {getTypeLabel(insight.type)}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{insight.description}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Impact:</span>
                    <p className="text-gray-800 mt-1">{insight.impact}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Recommendation:</span>
                    <p className="text-gray-800 mt-1">{insight.recommendation}</p>
                  </div>
                  
                  <div>
                    <span className="font-medium text-gray-600">Timeline:</span>
                    <p className="text-gray-800 mt-1">{insight.timeline}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Forecasting Timeline */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Timeline</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <div>
              <span className="font-medium text-red-800">Next 3 Months:</span>
              <span className="text-red-700 ml-2">Address critical training gaps and deployment rotations</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <div>
              <span className="font-medium text-yellow-800">6 Months:</span>
              <span className="text-yellow-700 ml-2">Implement fitness and skills development programs</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div>
              <span className="font-medium text-blue-800">12+ Months:</span>
              <span className="text-blue-700 ml-2">Long-term personnel planning and succession strategies</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}