import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Shield, Sparkles, ArrowRight, Activity, Brain, Calendar } from 'lucide-react';

export const WelcomePage = () => {
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
              "Your care. Your journey. Your companion."
            </p>
          </div>
        </div>
        <Link
          to="/login"
          className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold text-sm hover:scale-105 transition-all"
        >
          Log In
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[70vh]">
          {/* Left Content */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-sky-100 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              Supporting you through every step
            </div>

            <h2 className="text-5xl sm:text-6xl font-bold text-slate-800 dark:text-white leading-tight">
              Supporting you through every step of your <span className="block bg-gradient-to-r from-sky-500 to-indigo-600 bg-clip-text text-transparent">cancer care journey.</span>
            </h2>

            <p className="mt-6 text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
              Cancer Companion helps patients organize their treatment journey, track symptoms, manage medications and appointments, and maintain their wellbeing in one secure personal space.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <Link
                to="/signup"
                className="group px-7 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/login"
                className="px-7 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-slate-700 dark:text-slate-200 font-semibold hover:bg-white dark:hover:bg-slate-800 transition-all flex justify-center items-center"
              >
                Log In
              </Link>
            </div>
          </div>

          {/* Right Card */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-300/30 to-indigo-300/30 blur-3xl rounded-full" />
            <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white dark:border-slate-700 rounded-3xl p-7 shadow-2xl">
              
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-sky-50 dark:bg-slate-800">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Activity className="w-5 h-5 text-sky-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">Symptom & Medication Tracking</h4>
                    <p className="text-sm text-slate-500">Record your daily health metrics and prescriptions</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-indigo-50 dark:bg-slate-800">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Brain className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">AI Health Companion</h4>
                    <p className="text-sm text-slate-500">General supportive information</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 dark:bg-slate-800">
                  <div className="w-11 h-11 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center shadow-sm">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">Appointment & Timeline</h4>
                    <p className="text-sm text-slate-500">Manage doctor visits and treatment events</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white">
                <div className="flex items-center gap-3">
                  <Shield className="w-6 h-6" />
                  <div>
                    <p className="font-semibold text-sm">Secure and Private</p>
                    <p className="text-xs text-white/80">Your data is strictly protected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20 py-8 text-center text-sm text-slate-500">
         <p>&copy; {new Date().getFullYear()} Cancer Companion. All rights reserved.</p>
      </footer>
    </div>
  );
};
