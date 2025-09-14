import React, { useState } from 'react';
import { Target, Users, Star, CheckCircle, AlertCircle } from 'lucide-react';
import { useData } from '../context/DataContext';
import { Personnel } from '../types';

export function MissionAssignment() {
  const { personnel, updatePersonnel, addActivityLog } = useData();
  const [requiredRole, setRequiredRole] = useState('');
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [missionName, setMissionName] = useState('');
  const [candidates, setCandidates] = useState<Array<{ person: Personnel; score: number; reasoning: string }>>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);

  const availableRoles = [...new Set(personnel.map(p => p.role))];
  const availableSkills = [...new Set(personnel.flatMap(p => p.skills))];

  const calculateMatchScore = (person: Personnel): { score: number; reasoning: string } => {
    let score = 0;
    let factors = [];

    // Base availability check
    if (person.availability !== 'Available') {
      return { score: 0, reasoning: `Not available (${person.availability})` };
    }

    // Role match (40% of score)
    if (person.role === requiredRole) {
      score += 40;
      factors.push('Role match (+40)');
    }

    // Skills match (30% of score)
    const skillMatches = requiredSkills.filter(skill => person.skills.includes(skill));
    const skillScore = Math.round((skillMatches.length / Math.max(requiredSkills.length, 1)) * 30);
    score += skillScore;
    if (skillScore > 0) {
      factors.push(`Skills match: ${skillMatches.length}/${requiredSkills.length} (+${skillScore})`);
    }

    // Readiness (20% of score)
    const readinessScore = Math.round(person.readiness * 0.2);
    score += readinessScore;
    factors.push(`Readiness ${person.readiness}% (+${readinessScore})`);

    // Experience bonus (10% of score)
    const experienceScore = Math.min(person.yearsOfService * 2, 10);
    score += experienceScore;
    factors.push(`Experience ${person.yearsOfService} years (+${experienceScore})`);

    const reasoning = factors.join(', ');
    return { score, reasoning };
  };

  const handleSearch = () => {
    if (!requiredRole && requiredSkills.length === 0) {
      alert('Please select a role or skills requirement');
      return;
    }

    const scoredCandidates = personnel
      .map(person => {
        const { score, reasoning } = calculateMatchScore(person);
        return { person, score, reasoning };
      })
      .filter(candidate => candidate.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    setCandidates(scoredCandidates);
    addActivityLog('Mission Search', `Searched candidates for ${requiredRole} with skills: ${requiredSkills.join(', ')}`);
  };

  const handleAssignMission = () => {
    if (selectedCandidates.length === 0) {
      alert('Please select at least one candidate');
      return;
    }

    selectedCandidates.forEach(personId => {
      updatePersonnel(personId, { availability: 'Deployed' });
    });

    const assignedNames = candidates
      .filter(c => selectedCandidates.includes(c.person.id))
      .map(c => c.person.name)
      .join(', ');

    addActivityLog('Mission Assignment', `Assigned ${assignedNames} to mission: ${missionName || 'Unnamed Mission'}`);
    
    alert(`Successfully assigned ${selectedCandidates.length} personnel to mission`);
    
    // Reset form
    setSelectedCandidates([]);
    setCandidates([]);
    setMissionName('');
  };

  const toggleSkill = (skill: string) => {
    setRequiredSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mission Assignment Tool</h2>
          <p className="text-gray-600">AI-powered candidate selection for mission assignments</p>
        </div>
        <Target className="h-8 w-8 text-blue-600" />
      </div>

      {/* Mission Requirements */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mission Requirements</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mission Name (Optional)
            </label>
            <input
              type="text"
              value={missionName}
              onChange={(e) => setMissionName(e.target.value)}
              placeholder="e.g., Night Reconnaissance Operation"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Role
            </label>
            <select
              value={requiredRole}
              onChange={(e) => setRequiredRole(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Role</option>
              {availableRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Required Skills (Select multiple)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {availableSkills.map(skill => (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                  requiredSkills.includes(skill)
                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSearch}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Users className="h-5 w-5 mr-2" />
            Find Best Candidates
          </button>
        </div>
      </div>

      {/* Search Results */}
      {candidates.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Candidates (AI Ranked)
          </h3>
          
          <div className="space-y-4">
            {candidates.map((candidate, index) => (
              <div key={candidate.person.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedCandidates.includes(candidate.person.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedCandidates([...selectedCandidates, candidate.person.id]);
                        } else {
                          setSelectedCandidates(selectedCandidates.filter(id => id !== candidate.person.id));
                        }
                      }}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl font-bold text-gray-400">#{index + 1}</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{candidate.person.name}</h4>
                          <p className="text-sm text-gray-600">{candidate.person.rank} • {candidate.person.role}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 mb-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getScoreColor(candidate.score)}`}>
                          {candidate.score}% Match
                        </span>
                        <span className="text-sm text-gray-600">
                          {candidate.person.yearsOfService} years experience
                        </span>
                        <span className="text-sm text-gray-600">
                          Readiness: {candidate.person.readiness}%
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-700 mb-2">
                        <strong>Skills:</strong> {candidate.person.skills.join(', ')}
                      </div>
                      
                      <div className="text-xs text-gray-500">
                        <strong>AI Analysis:</strong> {candidate.reasoning}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-yellow-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {selectedCandidates.length > 0 && (
            <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                <span className="text-blue-800">
                  {selectedCandidates.length} candidate(s) selected for assignment
                </span>
              </div>
              
              <button
                onClick={handleAssignMission}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Assign to Mission
              </button>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">How AI Candidate Ranking Works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Role Match: 40 points for exact role match</li>
              <li>Skills Match: Up to 30 points based on required skills coverage</li>
              <li>Readiness Score: Up to 20 points based on overall readiness percentage</li>
              <li>Experience: Up to 10 points based on years of service</li>
              <li>Only available personnel are considered for assignment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}