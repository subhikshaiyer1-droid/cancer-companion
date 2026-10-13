import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  AlertTriangle,
  ShieldAlert,
  Apple,
  Pill,
  Droplet,
  Activity,
  Heart,
  Clock,
  HelpCircle,
  ExternalLink,
  Bot,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Sparkles,
  RefreshCw,
  Eye,
  BookOpen
} from 'lucide-react';

export const ReportAnalysisModal = ({
  report,
  isOpen,
  onClose,
  onUpdateContext
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview'); // overview, nutrition, meds, hydration, movement, routine, questions, warnings, rawText
  const [updating, setUpdating] = useState(false);

  // Follow-up form answers state
  const [followUpAnswers, setFollowUpAnswers] = useState({
    treatment: report?.patient_context?.treatment || '',
    prescribedMeds: report?.patient_context?.prescribedMeds || '',
    hasKidneyOrHeart: report?.patient_context?.hasKidneyOrHeart || 'No',
    symptoms: report?.patient_context?.symptoms || '',
    dietPreference: report?.patient_context?.dietPreference || 'Non-Vegetarian',
    activityRestrictions: report?.patient_context?.activityRestrictions || ''
  });

  if (!isOpen || !report) return null;

  const analysis = report.analysis_data || report.analysis || {};
  const overview = analysis.reportOverview || {};
  const findings = analysis.keyMedicalFindings || [];
  const simpleLang = analysis.simpleLanguageExplanation || {};
  const nutrition = analysis.nutritionGuidance || {};
  const meds = analysis.medicationInfo || {};
  const hydration = analysis.hydrationGuidance || {};
  const movement = analysis.movementPlan || {};
  const routine = analysis.dailyWellnessRoutine || {};
  const missingInfo = analysis.missingInfoAndDoctorQuestions || {};
  const warnings = analysis.importantWarnings || {};
  const extractedText = report.extracted_text || analysis.extractedText || '';

  const handleDiscussWithAI = () => {
    onClose();
    navigate('/ai-assistant', {
      state: {
        report: {
          id: report.id,
          title: report.title,
          category: report.category,
          date: report.date,
          analysis_data: analysis
        }
      }
    });
  };

  const handleRefinePlan = async (e) => {
    e.preventDefault();
    if (onUpdateContext) {
      setUpdating(true);
      try {
        await onUpdateContext(report, followUpAnswers);
        setActiveTab('overview');
      } finally {
        setUpdating(false);
      }
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview & Findings', icon: FileText },
    { id: 'nutrition', label: 'Nutrition & Diet', icon: Apple },
    { id: 'meds', label: 'Medications', icon: Pill },
    { id: 'hydration', label: 'Hydration', icon: Droplet },
    { id: 'movement', label: 'Movement & Exercise', icon: Activity },
    { id: 'routine', label: 'Daily Wellness Plan', icon: Clock },
    { id: 'questions', label: 'Doctor Questions & Gaps', icon: HelpCircle },
    { id: 'warnings', label: 'Safety & Warnings', icon: ShieldAlert, badge: 'Crucial' },
    { id: 'rawText', label: 'Extracted Text', icon: Eye }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-5xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden my-auto">
        
        {/* Top Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/60 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex-shrink-0 mt-0.5">
              <FileText className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300">
                  {overview.documentType || report.category || 'Medical Report'}
                </span>
                <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Analyzed: {overview.analysisDate || report.date || 'Recent'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 dark:text-slate-100 truncate">
                {report.title || overview.fileName || 'Clinical Report Analysis'}
              </h2>
              {report.doctor && (
                <p className="text-xs text-slate-500 mt-0.5">Documented Provider: {report.doctor}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleDiscussWithAI}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" />
              <span className="hidden sm:inline">Ask AI About Report</span>
              <span className="sm:hidden">Ask AI</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] uppercase px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
          
          {/* TAB 1: OVERVIEW & FINDINGS */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fade-in">
              {/* Summary Hero Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50 via-sky-50 to-purple-50 dark:from-indigo-950/40 dark:via-sky-950/30 dark:to-purple-950/30 border border-indigo-100 dark:border-indigo-900/60">
                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Report Summary & Clinical Scope
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                  {overview.summary || 'Summary of clinical observations extracted from uploaded medical document.'}
                </p>
                <div className="mt-4 pt-3 border-t border-indigo-200/50 dark:border-indigo-800/50 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] text-slate-500 block">Document Type</span>
                    <strong className="text-slate-800 dark:text-slate-100">{overview.documentType || 'Clinical Report'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Cancer Type</span>
                    <strong className="text-slate-800 dark:text-slate-100">{overview.cancerType || 'Not explicitly stated'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Stage / Grade</span>
                    <strong className="text-slate-800 dark:text-slate-100">{overview.stageOrGrade || 'Not stated'}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-500 block">Primary Site</span>
                    <strong className="text-slate-800 dark:text-slate-100">{overview.primarySite || 'Not stated'}</strong>
                  </div>
                </div>
              </div>

              {/* Key Medical Findings Section */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" /> Key Medical Findings & Laboratory Results
                </h3>
                {findings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {findings.map((item, idx) => {
                      const isNormal = item.status === 'Normal';
                      const isElevated = item.status === 'Elevated';
                      const isLow = item.status === 'Low';
                      return (
                        <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                isNormal ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' :
                                isElevated ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                isLow ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                                'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="text-lg font-black text-slate-900 dark:text-white mb-1">
                              {item.value}
                            </div>
                            {item.referenceRange && (
                              <div className="text-[11px] text-slate-400">
                                Standard Range: {item.referenceRange}
                              </div>
                            )}
                          </div>
                          {item.clinicalNote && (
                            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 leading-relaxed">
                              {item.clinicalNote}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500">
                    No discrete numerical markers found. Qualitative descriptive pathology narrative available.
                  </div>
                )}
              </div>

              {/* Simple Language Explanations */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-purple-500" /> Explanation in Simple Language
                </h3>
                {simpleLang.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                    {simpleLang.summary}
                  </p>
                )}
                {simpleLang.terms && simpleLang.terms.length > 0 && (
                  <div className="space-y-2.5">
                    {simpleLang.terms.map((t, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-xs">
                        <strong className="text-purple-700 dark:text-purple-300 block mb-0.5">{t.term}</strong>
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed">{t.plainMeaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: NUTRITION & DIET GUIDANCE */}
          {activeTab === 'nutrition' && (
            <div className="space-y-6 animate-fade-in">
              {/* Important Medical Disclaimer */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
                <span className="font-bold">EVIDENCE-BASED NUTRITION POLICY:</span> {nutrition.dietarySafetyDisclaimer || 'No food, diet, or supplement cures cancer, shrinks tumours, or replaces medical cancer treatment. These recommendations support maintaining nutrition and energy during therapy.'}
              </div>

              {/* Meal Ideas */}
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Apple className="w-5 h-5 text-emerald-500" /> Nourishing Daily Meal Suggestions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                  <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/60">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 block mb-1">Morning • Breakfast</span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{nutrition.mealIdeas?.breakfast}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/60">
                    <span className="text-[10px] font-extrabold uppercase text-sky-600 dark:text-sky-400 block mb-1">Midday • Lunch</span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{nutrition.mealIdeas?.lunch}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block mb-1">Evening • Dinner</span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{nutrition.mealIdeas?.dinner}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/60">
                    <span className="text-[10px] font-extrabold uppercase text-amber-600 dark:text-amber-400 block mb-1">Energy & Protein Snacks</span>
                    <p className="text-slate-700 dark:text-slate-200 leading-relaxed font-medium">{nutrition.mealIdeas?.snacks}</p>
                  </div>
                </div>
              </div>

              {/* Vegetarian vs Non-Vegetarian Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-emerald-600">
                    🌱 Vegetarian Protein & Meal Ideas
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
                    {nutrition.vegetarianOptions?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-sky-600">
                    🍗 Non-Vegetarian Protein & Meal Ideas
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
                    {nutrition.nonVegetarianOptions?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Nutrition-Related Symptom Guidance */}
              {nutrition.symptomGuidance && (
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-rose-500" /> Nutrition for Common Treatment Symptoms
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {Object.entries(nutrition.symptomGuidance).map(([key, text]) => (
                      <div key={key} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
                        <span className="font-bold text-indigo-600 dark:text-indigo-400 capitalize block mb-0.5">
                          {key.replace(/([A-Z])/g, ' $1')}
                        </span>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Foods to Avoid & Food Hygiene Precautions */}
              <div className="p-5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 text-xs space-y-4">
                <div>
                  <h4 className="font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-2 text-sm">
                    <ShieldAlert className="w-4 h-4" /> Foods to Avoid or Limit During Treatment
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                    {nutrition.foodsToAvoidOrLimit?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/60">
                  <h4 className="font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-2 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Food Safety & Hygiene Precautions (Neutropenic Safety)
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                    {nutrition.foodHygieneAndSafety?.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MEDICATION INFORMATION & QUESTIONS */}
          {activeTab === 'meds' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200 leading-relaxed font-semibold">
                {meds.criticalRulesNotice || 'CRITICAL SAFETY: Never start, stop, increase, or decrease prescribed cancer medicines independently. All medication changes must be made by your oncologist.'}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-purple-500" /> Medication Information and Questions for Your Oncologist
                </h3>

                {meds.hasMedicationsListed && meds.detectedMedications?.length > 0 ? (
                  <div className="space-y-3">
                    {meds.detectedMedications.map((m, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <strong className="text-sm font-bold text-purple-700 dark:text-purple-300">{m.name}</strong>
                          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                            Documented
                          </span>
                        </div>
                        <p className="text-slate-700 dark:text-slate-200"><span className="font-semibold">Stated Purpose:</span> {m.statedPurpose}</p>
                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">Precautions:</span> {m.commonPrecautions}</p>
                        <p className="text-slate-600 dark:text-slate-300"><span className="font-semibold">Potential Interactions:</span> {m.potentialInteractions}</p>
                        <p className="text-amber-700 dark:text-amber-300"><span className="font-semibold">When to seek review:</span> {m.whenToSeekReview}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                    <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">No Medications Explicitly Listed in Report</p>
                    <p>{meds.noMedsNotice || 'No medication list was provided in this report. Direct all prescription decisions to your primary oncologist or clinical pharmacist.'}</p>
                  </div>
                )}
              </div>

              {/* Questions for Oncologist/Pharmacist */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-purple-500" /> Questions to Ask Your Oncologist or Pharmacist
                </h4>
                <div className="space-y-2 text-xs">
                  {meds.questionsForOncologistOrPharmacist?.map((q, i) => (
                    <div key={i} className="p-3 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 text-slate-700 dark:text-slate-200 flex items-start gap-2">
                      <span className="font-bold text-purple-600">{i + 1}.</span>
                      <span>{q}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: HYDRATION GUIDANCE */}
          {activeTab === 'hydration' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60">
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Droplet className="w-4 h-4 text-blue-500" />
                  {hydration.sectionTitle || 'Daily Hydration Guidance'}
                </div>
                <h4 className="text-base font-extrabold text-blue-950 dark:text-blue-100 mb-2">
                  Fluid Intake Target: {hydration.fluidTargetLitresOrStatus}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
                  {hydration.whyHydrationMatters}
                </p>
                <div className="p-3 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-blue-100 dark:border-blue-900 text-xs text-blue-900 dark:text-blue-200">
                  <span className="font-bold block mb-1">Clinical Factors Considered:</span>
                  <ul className="space-y-1 list-disc pl-4 text-slate-600 dark:text-slate-300">
                    {hydration.clinicalFactorsConsidered?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Practical Reminders & Dehydration Signs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-blue-600">
                    💧 Practical Fluid Reminders
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
                    {hydration.practicalReminders?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs">
                  <h4 className="font-bold text-amber-800 dark:text-amber-200 mb-2 flex items-center gap-1.5">
                    ⚠️ Dehydration Warning Symptoms
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                    {hydration.dehydrationSymptoms?.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                  {hydration.urgentAssessmentTriggers && (
                    <p className="mt-2.5 pt-2 border-t border-amber-200 dark:border-amber-900 font-semibold text-amber-900 dark:text-amber-100">
                      {hydration.urgentAssessmentTriggers}
                    </p>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                {hydration.safetyNotice}
              </p>
            </div>
          )}

          {/* TAB 5: MOVEMENT & EXERCISE PLAN */}
          {activeTab === 'movement' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  {movement.sectionTitle || 'Movement and Exercise Plan'}
                </div>
                <h4 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 mb-1">
                  Gentle Recommended Frequency: {movement.suggestedFrequencyDuration}
                </h4>
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed mb-3">
                  {movement.restPeriods}
                </p>

                <div className="space-y-2 mt-4 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-100 block">Appropriate Activities:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {movement.suggestedActivities?.map((act, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 dark:text-slate-300">{act}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Safety Risks & Stop Triggers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                  <h4 className="font-bold text-rose-700 dark:text-rose-300 mb-2 flex items-center gap-1.5">
                    🛑 Stop Activity Immediately If You Feel:
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                    {movement.whenToStop?.map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-1.5 text-indigo-600">
                    🩺 Medical Restrictions & Clinical Risks
                  </h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-slate-600 dark:text-slate-300">
                    {movement.safetyRisksIdentified?.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                  {movement.clinicianApprovalRequired && (
                    <p className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 font-semibold text-indigo-600 dark:text-indigo-400">
                      Recommendation: Consult your oncologist or cancer physical therapist before initiating or modifying your routine.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: DAILY WELLNESS ROUTINE */}
          {activeTab === 'routine' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-indigo-500" /> {routine.sectionTitle || 'Daily Wellness Routine'}
                  </h3>
                  <span className="text-xs text-slate-500">
                    {routine.isPersonalized ? 'Personalized to documented findings' : 'General supportive educational guidance'}
                  </span>
                </div>
              </div>

              {routine.schedule && (
                <div className="space-y-3">
                  {[
                    { title: 'Morning Routine', key: 'morningRoutine', time: '07:30 AM', icon: '🌅' },
                    { title: 'Breakfast Suggestion', key: 'breakfast', time: '08:30 AM', icon: '🥣' },
                    { title: 'Mid-Morning Hydration', key: 'hydrationMorning', time: '10:30 AM', icon: '💧' },
                    { title: 'Gentle Movement & Walk', key: 'gentleMovement', time: '11:15 AM', icon: '🚶' },
                    { title: 'Lunch Suggestion', key: 'lunch', time: '12:45 PM', icon: '🥗' },
                    { title: 'Rest & Relaxation', key: 'restAndRelaxation', time: '02:00 PM', icon: '🛋️' },
                    { title: 'Evening Snack', key: 'eveningSnack', time: '04:30 PM', icon: '🥑' },
                    { title: 'Dinner Suggestion', key: 'dinner', time: '07:00 PM', icon: '🍲' },
                    { title: 'Sleep & Emotional Wellbeing', key: 'sleepAndEmotionalWellbeing', time: '09:30 PM', icon: '🌙' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-start gap-3.5">
                      <div className="text-2xl flex-shrink-0">{item.icon}</div>
                      <div className="min-w-0 flex-1 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="font-bold text-slate-800 dark:text-slate-100 text-sm">{item.title}</strong>
                          <span className="text-[11px] font-semibold text-indigo-500">{item.time}</span>
                        </div>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                          {routine.schedule[item.key] || 'Gentle pacing and supportive care.'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: DOCTOR QUESTIONS & GAPS */}
          {activeTab === 'questions' && (
            <div className="space-y-6 animate-fade-in">
              {/* Missing Information / Unstated Gaps */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 text-xs">
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-sky-500" /> Information Not Stated in This Document
                </h4>
                <p className="text-slate-500 mb-3">
                  To ensure clinical integrity, the AI never invents missing facts. The following elements were not explicitly documented in the uploaded file:
                </p>
                <ul className="space-y-1.5 list-disc pl-4 text-slate-700 dark:text-slate-300">
                  {missingInfo.unconfirmedOrMissingDetails?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              {/* Questions to Ask Doctor */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-500" /> High-Yield Questions for Your Next Clinical Visit
                </h4>
                <div className="space-y-2 text-xs">
                  {missingInfo.questionsForDoctor?.map((q, i) => (
                    <div key={i} className="p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900 text-slate-800 dark:text-slate-200 flex items-start gap-2.5">
                      <span className="font-bold text-indigo-600">{i + 1}.</span>
                      <span className="leading-relaxed">{q}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Follow-Up Questions to Refine Plan */}
              <div className="p-5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 text-xs">
                <h4 className="font-bold text-purple-900 dark:text-purple-200 mb-1 text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-600" /> Answer Follow-Up Questions to Personalize Your Plan
                </h4>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  Providing additional details helps our clinical safety engine customize your nutrition, hydration, and exercise guidance:
                </p>

                <form onSubmit={handleRefinePlan} className="space-y-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      1. What cancer treatment are you currently receiving?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Chemotherapy (Taxol), Radiation, Post-surgery, Monitoring..."
                      value={followUpAnswers.treatment}
                      onChange={(e) => setFollowUpAnswers({ ...followUpAnswers, treatment: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        2. Dietary Preference
                      </label>
                      <select
                        value={followUpAnswers.dietPreference}
                        onChange={(e) => setFollowUpAnswers({ ...followUpAnswers, dietPreference: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option>Non-Vegetarian</option>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                        <option>Pescatarian</option>
                      </select>
                    </div>

                    <div>
                      <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                        3. Do you have kidney/heart conditions or fluid restrictions?
                      </label>
                      <select
                        value={followUpAnswers.hasKidneyOrHeart}
                        onChange={(e) => setFollowUpAnswers({ ...followUpAnswers, hasKidneyOrHeart: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                      >
                        <option value="No">No known restrictions</option>
                        <option value="Kidney">Yes, Kidney / Renal issue</option>
                        <option value="Heart">Yes, Heart / Cardiac issue</option>
                        <option value="Both">Yes, both / Prescribed fluid limit</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      4. Are you experiencing active symptoms (nausea, mouth sores, fatigue, constipation)?
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mild nausea in mornings, sore mouth, low energy..."
                      value={followUpAnswers.symptoms}
                      onChange={(e) => setFollowUpAnswers({ ...followUpAnswers, symptoms: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {updating ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Updating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" /> Save & Update Wellness Guidance
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB 8: SAFETY & WARNINGS */}
          {activeTab === 'warnings' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800/80">
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  Urgent Clinical Safety & Emergency Triggers
                </div>
                <h4 className="text-base font-extrabold text-rose-950 dark:text-rose-100 mb-3">
                  Potentially Life-Threatening Oncology Symptoms Requiring Prompt Medical Assessment
                </h4>

                <div className="space-y-2 mb-4 text-xs">
                  {warnings.urgentSymptoms?.map((symp, i) => (
                    <div key={i} className="p-3 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5">
                      <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <span className="text-rose-900 dark:text-rose-200 font-medium leading-relaxed">{symp}</span>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl bg-rose-600 text-white text-xs font-bold text-center">
                  {warnings.urgentActionAdvice || 'If experiencing any urgent symptoms, do not delay. Contact your oncology emergency hotline immediately or proceed to the nearest emergency department.'}
                </div>
              </div>

              {/* General Disclaimer */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Medical Safety Statement</p>
                <p>{warnings.disclaimer}</p>
              </div>

              {/* Reputable Medical Sources */}
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 mb-2 text-sm flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-indigo-500" /> Reliable Clinical References
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  {analysis.medicalSources?.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-between"
                    >
                      <span>{src.name}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: EXTRACTED DOCUMENT TEXT */}
          {activeTab === 'rawText' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-indigo-500" /> Extracted Readable Text from Document
                  </h3>
                  <p className="text-xs text-slate-500">
                    Verify the exact text parsed from your PDF or scanned image before AI synthesis.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed selection:bg-indigo-500 selection:text-white">
                {extractedText || 'No text extracted or document was empty.'}
              </div>
            </div>
          )}

        </div>

        {/* Bottom Actions Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80 flex items-center justify-between">
          <button
            onClick={() => setActiveTab(activeTab === 'rawText' ? 'overview' : 'rawText')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            {activeTab === 'rawText' ? '← Back to Care Plan' : 'Inspect Extracted Text →'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDiscussWithAI}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4" /> Discuss with AI Assistant
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
