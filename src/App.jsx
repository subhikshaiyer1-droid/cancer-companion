import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
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

import {
  Heart,
  Shield,
  Sparkles,
  ArrowRight,
  Activity,
  Brain,
  Calendar
} from 'lucide-react';


function WelcomePage({ onOpenAuth }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-indigo-950">

      {/* Navigation */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">

        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <Heart className="w-6 h-6 text-white fill-white" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-slate-800 dark:text-white">
              Cancer Companion
            </h1>

            <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
              Your Calm Care Platform
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAuth}
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:scale-105 transition-all"
        >
          Sign In
        </button>

      </nav>


      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20">

        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">

          {/* Left Content */}
          <div>

            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-sm font-semibold">

              <Sparkles className="w-4 h-4" />

              Your personal healthcare companion

            </div>


            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-white leading-tight">

              You're not alone on your

              <span className="block bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">
                care journey.
              </span>

            </h2>


            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">

              Cancer Companion helps you organize your treatment,
              track symptoms, manage medications, monitor your wellness,
              and get supportive guidance — all in one calm and secure place.

            </p>


            <div className="flex flex-col sm:flex-row gap-4 mt-8">

              <button
                onClick={onOpenAuth}
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Get Started

                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>


              <button
                onClick={onOpenAuth}
                className="px-7 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-slate-800 transition-all"
              >
                Create Your Account
              </button>

            </div>


            <p className="mt-5 text-sm text-slate-400">
              Your journey. Your information. Your companion.
            </p>

          </div>


          {/* Right Card */}
          <div className="relative">

            <div className="absolute -inset-4 bg-gradient-to-r from-sky-300/30 to-indigo-300/30 blur-3xl rounded-full" />

            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-3xl p-7 shadow-2xl">

              <div className="flex items-center gap-3 mb-7">

                <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-sky-600 fill-sky-600" />
                </div>

                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                    Everything in one place
                  </h3>

                  <p className="text-sm text-slate-500">
                    Support designed around you
                  </p>
                </div>

              </div>


              <div className="space-y-4">

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 dark:bg-slate-800">

                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Activity className="w-5 h-5 text-sky-500" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      Track Your Health
                    </h4>

                    <p className="text-sm text-slate-500">
                      Symptoms, medications and wellness
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800">

                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Brain className="w-5 h-5 text-indigo-500" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      AI Health Companion
                    </h4>

                    <p className="text-sm text-slate-500">
                      Helpful guidance when you need it
                    </p>
                  </div>

                </div>


                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800">

                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">
                      Stay Organized
                    </h4>

                    <p className="text-sm text-slate-500">
                      Appointments and treatment timeline
                    </p>
                  </div>

                </div>

              </div>


              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white">

                <div className="flex items-center gap-3">

                  <Shield className="w-6 h-6" />

                  <div>
                    <p className="font-semibold text-sm">
                      Your care, your space
                    </p>

                    <p className="text-xs text-white/80">
                      Designed for a calmer healthcare journey
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


function AppContent() {

  const { isAuthenticated } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);


  const renderTabContent = () => {

    switch (activeTab) {

      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;

      case 'ai-assistant':
        return <AIAssistant />;

      case 'symptoms':
        return <SymptomTracker />;

      case 'medications':
        return <MedicationManager />;

      case 'appointments':
        return <AppointmentManager />;

      case 'timeline':
        return <TreatmentTimeline />;

      case 'reports':
        return <HealthReports />;

      case 'nutrition':
        return <NutritionGuide />;

      case 'wellness':
        return <MentalWellness />;

      case 'emergency':
        return <EmergencyContacts />;

      case 'community':
        return <CommunitySupport />;

      case 'admin':
        return <AdminPanel />;

      case 'settings':
        return <SettingsPage />;

      default:
        return <Dashboard setActiveTab={setActiveTab} />;

    }

  };


  /* USER NOT LOGGED IN */

  if (!isAuthenticated) {

    return (
      <>
        <WelcomePage
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
        />

        <ToastContainer />
      </>
    );

  }


  /* USER LOGGED IN */

  return (

    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 transition-colors">

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />


      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">

        <Header
          onToggleSidebar={() =>
            setIsSidebarOpen(!isSidebarOpen)
          }

          setActiveTab={setActiveTab}

          onOpenAuth={() =>
            setIsAuthModalOpen(true)
          }
        />


        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">

          {renderTabContent()}

        </main>

      </div>


      <ToastContainer />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

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