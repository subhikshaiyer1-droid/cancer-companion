import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import {
  Check,
  ChevronRight,
  HeartPulse,
  ClipboardList,
  Target,
} from 'lucide-react';

export const Onboarding = () => {
  const { profile, refreshProfile, setProfileState } = useAuth();
  const { addToast } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    phone_number: '',
    cancer_type: '',
    cancer_stage: '',
    diagnosis_date: '',
    hospital: '',
    doctor_name: '',
    goals: [],
  });

  const availableGoals = [
    'Track Symptoms',
    'Manage Medications',
    'Manage Appointments',
    'Improve Nutrition',
    'Mental Wellness',
    'Track Daily Health',
  ];

  /*
   * If onboarding has already been completed,
   * don't allow the user to stay on this page.
   */
  useEffect(() => {
    if (profile?.onboarding_completed) {
      navigate('/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  /*
   * Toggle selected goal.
   */
  const handleGoalToggle = (goal) => {
    setFormData((prev) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  /*
   * Move to next onboarding step.
   */
  const nextStep = () => {
    setStep((prev) => Math.min(prev + 1, 3));
  };

  /*
   * Move to previous onboarding step.
   */
  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  /*
   * Complete onboarding.
   *
   * Important:
   * - Gets the REAL authenticated Supabase user.
   * - Saves the profile to Supabase.
   * - Does not use fake/demo users.
   * - Does not depend on localStorage for the user ID.
   * - A refreshProfile failure will NOT prevent dashboard navigation
   *   after the profile has already been successfully saved.
   */
  const handleSubmit = async () => {
    if (loading) return;

    setLoading(true);

    try {
      /*
       * Get the current authenticated Supabase user.
       */
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error('Authentication error:', authError);
        throw authError;
      }

      if (!currentUser) {
        throw new Error(
          'Your session has expired. Please log in again.'
        );
      }

      /*
       * Prepare profile data.
       */
      const profileData = {
        id: currentUser.id,
        user_id: currentUser.id,

        full_name: formData.name.trim() || null,

        age: formData.age
          ? parseInt(formData.age, 10)
          : null,

        gender: formData.gender || null,

        phone: formData.phone_number.trim() || null,

        cancer_type: formData.cancer_type.trim() || null,

        cancer_stage: formData.cancer_stage.trim() || null,

        diagnosis_date:
          formData.diagnosis_date || null,

        hospital: formData.hospital.trim() || null,

        doctor_name:
          formData.doctor_name.trim() || null,

        goals: formData.goals || [],

        onboarding_completed: true,

        updated_at: new Date().toISOString(),
      };

      console.log(
        'Cancer Companion: Saving profile...',
        profileData
      );

      /*
       * Save profile to Supabase.
       *
       * The existing project uses the profiles table.
       */
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData, {
          onConflict: 'id',
        });

      /*
       * If Supabase rejects the save, STOP here.
       */
      if (profileError) {
        console.error(
          'Cancer Companion: Supabase profile error:',
          profileError
        );

        throw profileError;
      }

      console.log(
        'Cancer Companion: Profile saved successfully.'
      );

      /*
       * Update AuthContext state synchronously so ProtectedRoute sees onboarding_completed = true immediately.
       */
      if (typeof setProfileState === 'function') {
        setProfileState(profileData);
      }

      /*
       * Show success message.
       */
      addToast(
        'Profile Created',
        'Welcome to Cancer Companion!',
        'success'
      );

      /*
       * Refresh profile in background if needed.
       */
      try {
        if (typeof refreshProfile === 'function') {
          await refreshProfile(currentUser.id);
        }
      } catch (refreshError) {
        console.warn(
          'Cancer Companion: Profile refresh failed. Continuing to dashboard.',
          refreshError
        );
      }

      /*
       * Navigate to the actual dashboard.
       */
      navigate('/dashboard', {
        replace: true,
      });
    } catch (err) {
      console.error(
        'Cancer Companion: Error completing onboarding:',
        err
      );

      addToast(
        'Setup Failed',
        err?.message ||
        'Could not save your profile. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">

        {/* =========================================
            HEADER PROGRESS
        ========================================== */}
        <div className="flex bg-slate-100 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="flex-1 flex flex-col items-center"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === s
                    ? 'bg-sky-500 text-white'
                    : step > s
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
              >
                {step > s ? (
                  <Check className="w-4 h-4" />
                ) : (
                  s
                )}
              </div>

              <span
                className={`text-xs mt-2 font-medium ${step >= s
                    ? 'text-slate-800 dark:text-slate-200'
                    : 'text-slate-400'
                  }`}
              >
                {s === 1
                  ? 'Personal'
                  : s === 2
                    ? 'Health'
                    : 'Goals'}
              </span>
            </div>
          ))}
        </div>

        {/* =========================================
            CONTENT
        ========================================== */}
        <div className="p-8">

          {/* =========================================
              STEP 1 — PERSONAL
          ========================================== */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-sky-100 text-sky-600 rounded-xl">
                  <HeartPulse className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-bold">
                  Personal Information
                </h2>
              </div>

              <div className="space-y-4">

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Full Name
                  </label>

                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    placeholder="Your full name"
                  />
                </div>

                {/* Age + Gender */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Age
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="120"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.age}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          age: e.target.value,
                        })
                      }
                      placeholder="e.g. 45"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Gender
                    </label>

                    <select
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option value="">
                        Select...
                      </option>

                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>

                      <option value="Prefer not to say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        phone_number: e.target.value,
                      })
                    }
                    placeholder="+91 98765 43210"
                  />
                </div>

              </div>
            </div>
          )}

          {/* =========================================
              STEP 2 — HEALTH
          ========================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                  <ClipboardList className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-bold">
                  Health Information
                </h2>
              </div>

              <div className="space-y-4">

                {/* Cancer Type + Stage */}
                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Cancer Type
                    </label>

                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.cancer_type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancer_type: e.target.value,
                        })
                      }
                      placeholder="e.g. Breast Cancer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">
                      Stage
                    </label>

                    <input
                      type="text"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                      value={formData.cancer_stage}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cancer_stage: e.target.value,
                        })
                      }
                      placeholder="e.g. Stage II"
                    />
                  </div>

                </div>

                {/* Diagnosis Date */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Diagnosis Date
                  </label>

                  <input
                    type="date"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.diagnosis_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        diagnosis_date: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Hospital */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Hospital / Clinic
                  </label>

                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.hospital}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hospital: e.target.value,
                      })
                    }
                    placeholder="Where you receive care"
                  />
                </div>

                {/* Doctor */}
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Primary Doctor
                  </label>

                  <input
                    type="text"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    value={formData.doctor_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        doctor_name: e.target.value,
                      })
                    }
                    placeholder="Dr. Name"
                  />
                </div>

              </div>
            </div>
          )}

          {/* =========================================
              STEP 3 — GOALS
          ========================================== */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                  <Target className="w-6 h-6" />
                </div>

                <h2 className="text-2xl font-bold">
                  Personal Goals
                </h2>
              </div>

              <p className="text-sm text-slate-500 mb-4">
                Select what you'd like to focus on with Cancer Companion.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                {availableGoals.map((goal) => (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => handleGoalToggle(goal)}
                    className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${formData.goals.includes(goal)
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                  >
                    <span className="font-semibold text-sm">
                      {goal}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${formData.goals.includes(goal)
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300'
                        }`}
                    >
                      {formData.goals.includes(goal) && (
                        <Check className="w-3 h-3" />
                      )}
                    </div>
                  </button>
                ))}

              </div>
            </div>
          )}

          {/* =========================================
              FOOTER NAVIGATION
          ========================================== */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">

            {/* Back */}
            {step > 1 ? (
              <button
                type="button"
                onClick={prevStep}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Next */}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              /* Complete Setup */
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Setup'}

                {!loading && (
                  <Check className="w-4 h-4" />
                )}
              </button>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};