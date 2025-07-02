import React, { useState } from 'react';
import { HealthProvider, useHealth } from './contexts/HealthContext';
import { Header } from './components/Layout/Header';
import { Navigation } from './components/Layout/Navigation';
import { LoginScreen } from './components/Auth/LoginScreen';
import { PatientList } from './components/Patients/PatientList';
import { ConsultationList } from './components/Consultations/ConsultationList';
import { ReferralList } from './components/Referrals/ReferralList';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { SettingsPanel } from './components/Settings/SettingsPanel';

function AppContent() {
  const { currentUser } = useHealth();
  const [activeTab, setActiveTab] = useState('patients');

  if (!currentUser) {
    return <LoginScreen />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'patients':
        return <PatientList />;
      case 'consultations':
        return <ConsultationList />;
      case 'referrals':
        return <ReferralList />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <PatientList />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

function App() {
  return (
    <HealthProvider>
      <AppContent />
    </HealthProvider>
  );
}

export default App;