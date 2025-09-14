import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { PersonnelManagement } from './components/PersonnelManagement';
import { MissionAssignment } from './components/MissionAssignment';
import { PredictiveInsights } from './components/PredictiveInsights';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { ActivityLogs } from './components/ActivityLogs';
import { Settings } from './components/Settings';

function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (!user) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'personnel': return <PersonnelManagement />;
      case 'missions': return <MissionAssignment />;
      case 'insights': return <PredictiveInsights />;
      case 'simulator': return <WhatIfSimulator />;
      case 'logs': return <ActivityLogs />;
      case 'settings': return <Settings />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;