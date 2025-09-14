export interface Personnel {
  id: string;
  name: string;
  rank: string;
  role: string;
  skills: string[];
  healthScore: number;
  trainingScore: number;
  readiness: number;
  availability: 'Available' | 'Deployed' | 'Leave' | 'Medical';
  yearsOfService: number;
  deploymentStatus: string;
  lastTrainingDate: string;
  medicalRestrictions: string[];
  location?: string;
  phoneNumber?: string;
  email?: string;
}

export type UserRole = 'Commander' | 'HR' | 'Medical Officer';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

export interface Mission {
  id: string;
  name: string;
  requiredRole: string;
  requiredSkills: string[];
  assignedPersonnel: string[];
  status: 'Planning' | 'Active' | 'Completed';
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userId: string;
  username: string;
  action: string;
  details: string;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  timestamp: string;
}