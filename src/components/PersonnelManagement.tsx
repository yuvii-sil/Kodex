import React, { useState } from 'react';
import { Search, Filter, Eye, Edit, Download, Upload } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Personnel } from '../types';
import { PersonnelModal } from './PersonnelModal';
import { format } from 'date-fns';
import Papa from 'papaparse';

export function PersonnelManagement() {
  const { personnel, importData, addActivityLog } = useData();
  const { hasPermission } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredPersonnel = personnel.filter(person => {
    const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.rank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = !roleFilter || person.role === roleFilter;
    const matchesAvailability = !availabilityFilter || person.availability === availabilityFilter;
    
    return matchesSearch && matchesRole && matchesAvailability;
  });

  const roles = [...new Set(personnel.map(p => p.role))];
  const availabilities = [...new Set(personnel.map(p => p.availability))];

  const handleViewPerson = (person: Personnel) => {
    setSelectedPerson(person);
    setShowModal(true);
    addActivityLog('View Personnel', `Viewed profile for ${person.name}`);
  };

  const handleExportData = () => {
    const csvData = personnel.map(person => ({
      ID: person.id,
      Name: person.name,
      Rank: person.rank,
      Role: person.role,
      Skills: person.skills.join('; '),
      'Health Score': person.healthScore,
      'Training Score': person.trainingScore,
      'Readiness %': person.readiness,
      Availability: person.availability,
      'Years of Service': person.yearsOfService,
      'Deployment Status': person.deploymentStatus,
      'Last Training': person.lastTrainingDate,
      'Medical Restrictions': person.medicalRestrictions.join('; ')
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `personnel-export-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addActivityLog('Export Data', `Exported ${personnel.length} personnel records`);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const importedPersonnel = results.data.map((row: any, index: number) => ({
            id: row.ID || `imported-${Date.now()}-${index}`,
            name: row.Name || '',
            rank: row.Rank || '',
            role: row.Role || '',
            skills: row.Skills ? row.Skills.split('; ') : [],
            healthScore: parseInt(row['Health Score']) || 0,
            trainingScore: parseInt(row['Training Score']) || 0,
            readiness: parseInt(row['Readiness %']) || 0,
            availability: row.Availability as Personnel['availability'] || 'Available',
            yearsOfService: parseInt(row['Years of Service']) || 0,
            deploymentStatus: row['Deployment Status'] || '',
            lastTrainingDate: row['Last Training'] || new Date().toISOString().split('T')[0],
            medicalRestrictions: row['Medical Restrictions'] ? row['Medical Restrictions'].split('; ') : []
          })) as Personnel[];

          importData(importedPersonnel);
          alert(`Successfully imported ${importedPersonnel.length} personnel records`);
        } catch (error) {
          alert('Error importing data. Please check file format.');
        }
      },
      error: () => {
        alert('Error reading file. Please try again.');
      }
    });

    event.target.value = '';
  };

  const getReadinessColor = (readiness: number) => {
    if (readiness >= 90) return 'text-green-600 bg-green-100';
    if (readiness >= 80) return 'text-blue-600 bg-blue-100';
    if (readiness >= 70) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'text-green-600 bg-green-100';
      case 'Deployed': return 'text-blue-600 bg-blue-100';
      case 'Leave': return 'text-yellow-600 bg-yellow-100';
      case 'Medical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Personnel Management</h2>
          <p className="text-gray-600">Manage and monitor air force personnel</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <label htmlFor="import-csv" className="cursor-pointer">
            <input
              id="import-csv"
              type="file"
              accept=".csv"
              onChange={handleImportData}
              className="hidden"
            />
            <div className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </div>
          </label>
          
          {hasPermission('export') && (
            <button
              onClick={handleExportData}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search personnel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Availability</option>
            {availabilities.map(availability => (
              <option key={availability} value={availability}>{availability}</option>
            ))}
          </select>

          <div className="flex items-center text-sm text-gray-600">
            <Filter className="h-4 w-4 mr-2" />
            {filteredPersonnel.length} of {personnel.length} personnel
          </div>
        </div>
      </div>

      {/* Personnel Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Personnel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role & Skills
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Readiness
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Availability
                </th>
                {hasPermission('health-scores') && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Health
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPersonnel.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 cursor-pointer">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{person.name}</div>
                      <div className="text-sm text-gray-500">{person.rank}</div>
                      <div className="text-xs text-gray-400">{person.yearsOfService} years service</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{person.role}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {person.skills.slice(0, 2).join(', ')}
                      {person.skills.length > 2 && ' +more'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getReadinessColor(person.readiness)}`}>
                      {person.readiness}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getAvailabilityColor(person.availability)}`}>
                      {person.availability}
                    </span>
                  </td>
                  {hasPermission('health-scores') && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {person.healthScore}%
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {person.trainingScore}%
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewPerson(person)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Personnel Modal */}
      {showModal && selectedPerson && (
        <PersonnelModal
          person={selectedPerson}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}