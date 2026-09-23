import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import { Sidebar } from './components/Navigation/Sidebar';
import { Header } from './components/Navigation/Header';
import { ToastContainer } from './components/UI/ToastContainer';
import { ProtectedRoute } from './components/Navigation/ProtectedRoute';

// Pages
import { WelcomePage } from './pages/Welcome/WelcomePage';
import { Login } from './pages/Auth/Login';
import { Signup } from './pages/Auth/Signup';
import { Onboarding } from './pages/Onboarding/Onboarding';

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
import { SettingsPage } from './pages/Settings/SettingsPage';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Onboarding - Requires auth, but handles its own logic for completion */}
            <Route path="/onboarding" element={<Onboarding />} />

            {/* Protected Routes (Require Auth & Onboarding) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/ai-assistant" element={<AIAssistant />} />
                <Route path="/symptoms" element={<SymptomTracker />} />
                <Route path="/medications" element={<MedicationManager />} />
                <Route path="/appointments" element={<AppointmentManager />} />
                <Route path="/timeline" element={<TreatmentTimeline />} />
                <Route path="/reports" element={<HealthReports />} />
                <Route path="/nutrition" element={<NutritionGuide />} />
                <Route path="/wellness" element={<MentalWellness />} />
                <Route path="/emergency" element={<EmergencyContacts />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>
          </Routes>
          <ToastContainer />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}