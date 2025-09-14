import { Personnel, Alert } from '../types';

export const mockPersonnel: Personnel[] = [
  {
    id: '001',
    name: 'Capt. Alex Thompson',
    rank: 'Captain',
    role: 'Pilot',
    skills: ['Fighter Operations', 'Night Ops', 'Air-to-Air Combat'],
    healthScore: 92,
    trainingScore: 88,
    readiness: 90,
    availability: 'Available',
    yearsOfService: 8,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-15',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0101',
    email: 'a.thompson@iaf.mil'
  },
  {
    id: '002',
    name: 'Lt. Sarah Wilson',
    rank: 'Lieutenant',
    role: 'Engineer',
    skills: ['Aircraft Maintenance', 'Electronics', 'Systems Analysis'],
    healthScore: 85,
    trainingScore: 94,
    readiness: 90,
    availability: 'Available',
    yearsOfService: 5,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-10',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0102',
    email: 's.wilson@iaf.mil'
  },
  {
    id: '003',
    name: 'Sgt. Mike Johnson',
    rank: 'Sergeant',
    role: 'Medic',
    skills: ['Emergency Medicine', 'Field Surgery', 'Triage'],
    healthScore: 78,
    trainingScore: 91,
    readiness: 85,
    availability: 'Deployed',
    yearsOfService: 12,
    deploymentStatus: 'Forward Base Charlie',
    lastTrainingDate: '2024-11-20',
    medicalRestrictions: ['Limited Heavy Lifting'],
    location: 'Forward Base Charlie',
    phoneNumber: '+1-555-0103',
    email: 'm.johnson@iaf.mil'
  },
  {
    id: '004',
    name: 'Maj. Lisa Chen',
    rank: 'Major',
    role: 'Intelligence',
    skills: ['Data Analysis', 'Surveillance', 'Threat Assessment'],
    healthScore: 89,
    trainingScore: 96,
    readiness: 93,
    availability: 'Available',
    yearsOfService: 10,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-18',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0104',
    email: 'l.chen@iaf.mil'
  },
  {
    id: '005',
    name: 'Lt. Col. Robert Davis',
    rank: 'Lieutenant Colonel',
    role: 'Pilot',
    skills: ['Transport Operations', 'Formation Flying', 'Navigation'],
    healthScore: 82,
    trainingScore: 85,
    readiness: 84,
    availability: 'Leave',
    yearsOfService: 15,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-10-15',
    medicalRestrictions: ['Vision Correction Required'],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0105',
    email: 'r.davis@iaf.mil'
  },
  {
    id: '006',
    name: 'Cpl. Emma Rodriguez',
    rank: 'Corporal',
    role: 'Communications',
    skills: ['Radio Operations', 'Satellite Comm', 'Encryption'],
    healthScore: 91,
    trainingScore: 87,
    readiness: 89,
    availability: 'Available',
    yearsOfService: 4,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-05',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0106',
    email: 'e.rodriguez@iaf.mil'
  },
  {
    id: '007',
    name: 'Capt. James Anderson',
    rank: 'Captain',
    role: 'Engineer',
    skills: ['Avionics', 'Radar Systems', 'Electronic Warfare'],
    healthScore: 76,
    trainingScore: 92,
    readiness: 84,
    availability: 'Medical',
    yearsOfService: 9,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-11-28',
    medicalRestrictions: ['Temporary Duty Restriction'],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0107',
    email: 'j.anderson@iaf.mil'
  },
  {
    id: '008',
    name: 'Lt. Maria Gonzalez',
    rank: 'Lieutenant',
    role: 'Pilot',
    skills: ['Helicopter Operations', 'Search & Rescue', 'Medical Evacuation'],
    healthScore: 94,
    trainingScore: 89,
    readiness: 92,
    availability: 'Available',
    yearsOfService: 6,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-12',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0108',
    email: 'm.gonzalez@iaf.mil'
  },
  {
    id: '009',
    name: 'MSgt. David Kim',
    rank: 'Master Sergeant',
    role: 'Security',
    skills: ['Base Security', 'Counter-Intelligence', 'Weapons Training'],
    healthScore: 87,
    trainingScore: 93,
    readiness: 90,
    availability: 'Available',
    yearsOfService: 14,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-12-08',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0109',
    email: 'd.kim@iaf.mil'
  },
  {
    id: '010',
    name: 'Capt. Jennifer Brown',
    rank: 'Captain',
    role: 'Logistics',
    skills: ['Supply Chain', 'Resource Planning', 'Transportation'],
    healthScore: 83,
    trainingScore: 88,
    readiness: 86,
    availability: 'Available',
    yearsOfService: 7,
    deploymentStatus: 'Home Base',
    lastTrainingDate: '2024-11-30',
    medicalRestrictions: [],
    location: 'Base Alpha',
    phoneNumber: '+1-555-0110',
    email: 'j.brown@iaf.mil'
  }
];

export const generateAlerts = (personnel: Personnel[]): Alert[] => {
  const alerts: Alert[] = [];
  
  // Training alerts
  const needsTraining = personnel.filter(p => p.trainingScore < 80).length;
  if (needsTraining > 0) {
    alerts.push({
      id: 'training-alert',
      type: needsTraining > 3 ? 'critical' : 'warning',
      title: 'Training Requirements',
      description: `${needsTraining} personnel require immediate training updates`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Health alerts
  const healthIssues = personnel.filter(p => p.healthScore < 75).length;
  if (healthIssues > 0) {
    alerts.push({
      id: 'health-alert',
      type: 'warning',
      title: 'Health & Fitness',
      description: `${healthIssues} personnel have health scores below 75`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Availability alerts
  const unavailable = personnel.filter(p => p.availability !== 'Available').length;
  const readinessImpact = Math.round((unavailable / personnel.length) * 100);
  
  if (readinessImpact > 30) {
    alerts.push({
      id: 'readiness-alert',
      type: 'critical',
      title: 'Readiness Impact',
      description: `${readinessImpact}% of personnel are unavailable, impacting unit readiness`,
      timestamp: new Date().toISOString()
    });
  }
  
  // Deployment rotation alert
  const deployedPersonnel = personnel.filter(p => p.availability === 'Deployed');
  if (deployedPersonnel.length > personnel.length * 0.4) {
    alerts.push({
      id: 'deployment-alert',
      type: 'warning',
      title: 'Deployment Rotation',
      description: `High deployment rate may require rotation planning`,
      timestamp: new Date().toISOString()
    });
  }
  
  return alerts;
};