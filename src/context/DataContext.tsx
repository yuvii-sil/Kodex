import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Personnel, Mission, ActivityLog, Alert } from '../types';
import { mockPersonnel, generateAlerts } from '../data/mockData';
import { useAuth } from './AuthContext';

interface DataContextType {
  personnel: Personnel[];
  missions: Mission[];
  activityLogs: ActivityLog[];
  alerts: Alert[];
  updatePersonnel: (id: string, updates: Partial<Personnel>) => void;
  addMission: (mission: Mission) => void;
  addActivityLog: (action: string, details: string) => void;
  importData: (data: Personnel[]) => void;
  simulateRealTimeUpdates: boolean;
  setSimulateRealTimeUpdates: (enabled: boolean) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [personnel, setPersonnel] = useState<Personnel[]>(mockPersonnel);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [simulateRealTimeUpdates, setSimulateRealTimeUpdates] = useState(true);
  const { user } = useAuth();

  // Initialize alerts
  useEffect(() => {
    setAlerts(generateAlerts(personnel));
  }, [personnel]);

  // Real-time simulation
  useEffect(() => {
    if (!simulateRealTimeUpdates) return;

    const interval = setInterval(() => {
      setPersonnel(prev => {
        const updated = [...prev];
        const randomIndex = Math.floor(Math.random() * updated.length);
        const person = { ...updated[randomIndex] };
        
        // Randomly update health score, training score, or availability
        const updateType = Math.random();
        
        if (updateType < 0.4) {
          person.healthScore = Math.max(50, Math.min(100, person.healthScore + (Math.random() - 0.5) * 10));
        } else if (updateType < 0.7) {
          person.trainingScore = Math.max(50, Math.min(100, person.trainingScore + (Math.random() - 0.5) * 8));
        } else if (updateType < 0.9) {
          const statuses: Personnel['availability'][] = ['Available', 'Deployed', 'Leave'];
          person.availability = statuses[Math.floor(Math.random() * statuses.length)];
        }
        
        // Recalculate readiness
        person.readiness = Math.round((person.healthScore + person.trainingScore) / 2);
        
        updated[randomIndex] = person;
        return updated;
      });
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [simulateRealTimeUpdates]);

  const updatePersonnel = (id: string, updates: Partial<Personnel>) => {
    setPersonnel(prev => 
      prev.map(person => 
        person.id === id ? { ...person, ...updates } : person
      )
    );
    
    if (user) {
      addActivityLog('Update Personnel', `Updated personnel ${id}`);
    }
  };

  const addMission = (mission: Mission) => {
    setMissions(prev => [...prev, mission]);
    if (user) {
      addActivityLog('Create Mission', `Created mission: ${mission.name}`);
    }
  };

  const addActivityLog = (action: string, details: string) => {
    if (!user) return;
    
    const log: ActivityLog = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      userId: user.id,
      username: user.name,
      action,
      details
    };
    
    setActivityLogs(prev => [log, ...prev.slice(0, 99)]); // Keep last 100 logs
  };

  const importData = (data: Personnel[]) => {
    setPersonnel(data);
    if (user) {
      addActivityLog('Import Data', `Imported ${data.length} personnel records`);
    }
  };

  return (
    <DataContext.Provider value={{
      personnel,
      missions,
      activityLogs,
      alerts,
      updatePersonnel,
      addMission,
      addActivityLog,
      importData,
      simulateRealTimeUpdates,
      setSimulateRealTimeUpdates
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}