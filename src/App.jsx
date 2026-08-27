import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';
import { ToastContainer } from './components/UI/ToastContainer';
import { AuthModal } from './pages/Auth/AuthModal';

import { Dashboard } from './pages/Dashboard/Dashboard';
import { AIAssistant } from './pages/AIAssistant/AIAssistant';
import { SymptomTracker } from './pages/SymptomTracker/SymptomTracker';
import { MedicationManager } from './pages/Medications/MedicationManager';
import { AppointmentManager } from './pages/Appointments/AppointmentManager';
import { TreatmentTimeline } from './pages/TreatmentTimeline/TreatmentTimeline';
import { HealthReports } from './pages/HealthReports/HealthReports';
import { NutritionGuide } from './pages/Nutrition/NutritionGuide';
import { MentalWellness } from './pages/MentalWellness/MentalWellness';
import { EmergencyContacts } from './pages/Emergency/EmergencyContacts';
import { CommunitySupport } from './pages/Community/CommunitySupport';
import { AdminPanel } from './pages/Admin/AdminPanel';
import { SettingsPage } from './pages/Settings/SettingsPage';


function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'ai-assistant': return <AIAssistant />;
      case 'symptoms': return <SymptomTracker />;
      case 'medications': return <MedicationManager />;
      case 'appointments': return <AppointmentManager />;
      case 'timeline': return <TreatmentTimeline />;
      case 'reports': return <HealthReports />;
      case 'nutrition': return <NutritionGuide />;
      case 'wellness': return <MentalWellness />;
      case 'emergency': return <EmergencyContacts />;
      case 'community': return <CommunitySupport />;
      case 'admin': return <AdminPanel />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Layout Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          setActiveTab={setActiveTab}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderTabContent()}
        </main>
      </div>

      <ToastContainer />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
