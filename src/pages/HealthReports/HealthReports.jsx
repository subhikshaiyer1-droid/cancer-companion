import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import {
  FileText,
  UploadCloud,
  Download,
  Image as ImageIcon,
  Eye,
  Calendar,
  Tag,
  Plus,
  Check,
  Bot,
  AlertCircle,
  Trash2,
  Sparkles,
  RefreshCw,
  Activity,
  Apple,
  Pill,
  Droplet,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { ReportAnalysisModal } from '../../components/Reports/ReportAnalysisModal';

export const HealthReports = () => {
  const { user } = useAuth();
  const { addToast } = useTheme();
  const navigate = useNavigate();

  const [reports, setReports] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Analysis modal state
  const [activeAnalysisReport, setActiveAnalysisReport] = useState(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);

  // Upload state
  const [uploadTab, setUploadTab] = useState('file'); // 'file' or 'text'
  const [selectedFile, setSelectedFile] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgressStep, setUploadProgressStep] = useState('');
  const [uploadError, setUploadError] = useState(null);

  const [newReportMeta, setNewReportMeta] = useState({
    title: '',
    category: 'Pathology',
    doctor: '',
    notes: '',
    treatment: '',
    dietPreference: 'Non-Vegetarian',
    hasKidneyOrHeart: 'No'
  });

  const categories = [
    'All',
    'Pathology',
    'Blood Work',
    'Scans & Imaging',
    'Prescriptions',
    'Discharge Summary'
  ];

  const filteredReports = selectedCategory === 'All'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  useEffect(() => {
    if (!user) return;
    loadReports();
  }, [user]);

  const loadReports = async () => {
    setLoading(true);
    try {
      if (!supabase) {
        setReports([]);
        return;
      }

      const { data, error } = await supabase
        .from('health_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (err) {
      console.error('Error loading reports:', err);
      addToast('Error', 'Could not load health reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const validExtensions = /\.(pdf|png|jpe?g|webp)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setUploadError('Unsupported file type. Please upload a PDF document or image file (JPG, PNG).');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setUploadError('File size exceeds 20MB limit. Please upload a smaller file.');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
    if (!newReportMeta.title) {
      // Auto-populate title from filename
      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      setNewReportMeta(prev => ({ ...prev, title: cleanName }));
    }
  };

  const resizeImageIfNeeded = (file) => {
    return new Promise((resolve) => {
      if (!file.type || !file.type.startsWith('image/')) {
        return resolve(file);
      }
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_DIM = 2000;
        let width = img.width;
        let height = img.height;
        if (width <= MAX_DIM && height <= MAX_DIM && file.size < 2.5 * 1024 * 1024) {
          return resolve(file);
        }
        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, { type: 'image/jpeg' });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, 'image/jpeg', 0.88);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(file);
      };
      img.src = url;
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result.split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleAnalyzeAndUpload = async (e) => {
    e.preventDefault();
    setUploadError(null);

    if (uploadTab === 'file' && !selectedFile) {
      setUploadError('Please choose a PDF or image report to upload.');
      return;
    }
    if (uploadTab === 'text' && (!pastedText || pastedText.trim().length < 20)) {
      setUploadError('Please paste or type at least 20 characters of report text.');
      return;
    }
    if (!newReportMeta.title.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }

    setUploading(true);
    setUploadProgressStep('Reading document and extracting text...');

    try {
      let fileBase64 = null;
      let mimeType = '';
      let fileName = selectedFile?.name || `${newReportMeta.title}.txt`;
      let fileSize = selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : 'Text Entry';
      let fileType = selectedFile?.name.toLowerCase().endsWith('.pdf') ? 'pdf' : (selectedFile ? 'image' : 'text');

      if (uploadTab === 'file' && selectedFile) {
        const fileToSend = await resizeImageIfNeeded(selectedFile);
        fileBase64 = await fileToBase64(fileToSend);
        mimeType = fileToSend.type || selectedFile.type;
      }

      setUploadProgressStep('Analyzing clinical findings and tumour markers...');

      const patientContext = {
        treatment: newReportMeta.treatment || undefined,
        dietPreference: newReportMeta.dietPreference,
        hasKidneyIssues: newReportMeta.hasKidneyOrHeart.includes('Kidney') || newReportMeta.hasKidneyOrHeart.includes('Both'),
        hasHeartIssues: newReportMeta.hasKidneyOrHeart.includes('Heart') || newReportMeta.hasKidneyOrHeart.includes('Both')
      };

      // Call protected server-side API endpoint
      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fileBase64,
          mimeType,
          fileName,
          text: uploadTab === 'text' ? pastedText : undefined,
          patientContext
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Analysis failed with status ${response.status}`);
      }

      setUploadProgressStep('Formulating personalized nutrition & wellness plan...');
      const result = await response.json();

      const analysisData = result.analysis;
      const extractedText = result.extractedText;

      setUploadProgressStep('Saving report securely to your health records...');

      // Save to Supabase
      let insertedRecord = null;
      if (supabase && user) {
        const payloadWithAllColumns = {
          user_id: user.id,
          title: newReportMeta.title,
          category: newReportMeta.category,
          doctor: newReportMeta.doctor || null,
          notes: analysisData.reportOverview?.summary || newReportMeta.notes || null,
          date: new Date().toISOString().split('T')[0],
          file_type: fileType,
          file_size: fileSize,
          extracted_text: extractedText,
          analysis_data: analysisData,
          document_type: analysisData.documentType || newReportMeta.category,
          patient_context: patientContext
        };

        const { data, error } = await supabase
          .from('health_reports')
          .insert([payloadWithAllColumns])
          .select();

        if (error) {
          console.warn('Initial insert with extended columns failed, trying fallback with base columns:', error.message);
          // Fallback if remote schema doesn't have new columns yet
          const fallbackPayload = {
            user_id: user.id,
            title: newReportMeta.title,
            category: newReportMeta.category,
            doctor: newReportMeta.doctor || null,
            notes: JSON.stringify({
              summary: analysisData.reportOverview?.summary,
              analysis: analysisData,
              extracted_text: extractedText.slice(0, 500)
            }),
            date: new Date().toISOString().split('T')[0],
            file_type: fileType,
            file_size: fileSize
          };

          const fallbackRes = await supabase
            .from('health_reports')
            .insert([fallbackPayload])
            .select();

          if (fallbackRes.error) throw fallbackRes.error;
          insertedRecord = {
            ...fallbackRes.data[0],
            analysis_data: analysisData,
            extracted_text: extractedText,
            patient_context: patientContext
          };
        } else {
          insertedRecord = data[0];
        }
      } else {
        // Offline / demo fallback
        insertedRecord = {
          id: `local-${Date.now()}`,
          user_id: user?.id || 'demo-user',
          title: newReportMeta.title,
          category: newReportMeta.category,
          doctor: newReportMeta.doctor || null,
          notes: analysisData.reportOverview?.summary || '',
          date: new Date().toISOString().split('T')[0],
          file_type: fileType,
          file_size: fileSize,
          extracted_text: extractedText,
          analysis_data: analysisData,
          document_type: analysisData.documentType,
          patient_context: patientContext
        };
      }

      setReports([insertedRecord, ...reports]);
      setShowUploadModal(false);
      setSelectedFile(null);
      setPastedText('');
      setNewReportMeta({
        title: '',
        category: 'Pathology',
        doctor: '',
        notes: '',
        treatment: '',
        dietPreference: 'Non-Vegetarian',
        hasKidneyOrHeart: 'No'
      });

      addToast('Report Analyzed', `${insertedRecord.title} analyzed and saved.`, 'success');

      // Automatically open the rich analysis view!
      setActiveAnalysisReport(insertedRecord);
      setIsAnalysisModalOpen(true);
    } catch (err) {
      console.error('Report analysis error:', err);
      setUploadError(err.message || 'Unable to analyze the report. Please verify the document is clear and try again.');
    } finally {
      setUploading(false);
      setUploadProgressStep('');
    }
  };

  const handleUpdateContext = async (reportToUpdate, updatedAnswers) => {
    try {
      const patientContext = {
        treatment: updatedAnswers.treatment,
        dietPreference: updatedAnswers.dietPreference,
        hasKidneyIssues: updatedAnswers.hasKidneyOrHeart.includes('Kidney') || updatedAnswers.hasKidneyOrHeart.includes('Both'),
        hasHeartIssues: updatedAnswers.hasKidneyOrHeart.includes('Heart') || updatedAnswers.hasKidneyOrHeart.includes('Both'),
        symptoms: updatedAnswers.symptoms,
        activityRestrictions: updatedAnswers.activityRestrictions
      };

      const response = await fetch('/api/reports/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: reportToUpdate.extracted_text || reportToUpdate.notes,
          fileName: reportToUpdate.title,
          patientContext
        })
      });

      if (!response.ok) throw new Error('Failed to update analysis');
      const result = await response.json();

      const updatedReport = {
        ...reportToUpdate,
        analysis_data: result.analysis,
        patient_context: patientContext
      };

      // Update in Supabase
      if (supabase && user && reportToUpdate.id && !reportToUpdate.id.startsWith('local-')) {
        await supabase
          .from('health_reports')
          .update({
            analysis_data: result.analysis,
            patient_context: patientContext
          })
          .eq('id', reportToUpdate.id);
      }

      // Update local state
      setReports(prev => prev.map(r => r.id === reportToUpdate.id ? updatedReport : r));
      setActiveAnalysisReport(updatedReport);
      addToast('Plan Updated', 'Support plan refined with your responses.', 'success');
    } catch (err) {
      console.error('Update context error:', err);
      addToast('Error', 'Could not refine plan with new information', 'error');
    }
  };

  const handleDeleteReport = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      if (supabase && user && !id.startsWith('local-')) {
        const { error } = await supabase
          .from('health_reports')
          .delete()
          .eq('id', id);
        if (error) throw error;
      }

      setReports(prev => prev.filter(r => r.id !== id));
      if (activeAnalysisReport?.id === id) {
        setIsAnalysisModalOpen(false);
        setActiveAnalysisReport(null);
      }
      addToast('Report Deleted', `${title} removed from records.`, 'success');
    } catch (err) {
      console.error('Delete error:', err);
      addToast('Error', 'Could not delete report', 'error');
    }
  };

  const openAnalysis = (report) => {
    // If analysis_data is stored as JSON in notes fallback
    let analysisData = report.analysis_data;
    if (!analysisData && report.notes) {
      try {
        const parsed = JSON.parse(report.notes);
        if (parsed.analysis) {
          analysisData = parsed.analysis;
        }
      } catch {
        // Not JSON
      }
    }

    setActiveAnalysisReport({
      ...report,
      analysis_data: analysisData || report.analysis_data
    });
    setIsAnalysisModalOpen(true);
  };

  const openChatWithReport = (report) => {
    navigate('/ai-assistant', {
      state: {
        report: {
          id: report.id,
          title: report.title,
          category: report.category,
          date: report.date,
          analysis_data: report.analysis_data
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-500" /> Medical Reports & AI Wellness Plans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload biopsy, histopathology, CBC blood work, or imaging scans for instant clinical analysis & personalized care plans
          </p>
        </div>

        <button
          onClick={() => {
            setUploadError(null);
            setShowUploadModal(true);
          }}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" /> Upload & Analyze Report
        </button>
      </div>

      {/* Clinical Disclaimer & Safety Banner */}
      <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-start gap-3 text-sky-900 dark:text-sky-200">
        <ShieldAlert className="w-5 h-5 text-sky-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold">CLINICAL PRIVACY & SAFETY:</span> Reports are analyzed on a secure server. Personal medical data is never logged or exposed. Extracted findings inform supportive nutrition, hydration, and movement recommendations, but <strong>never</strong> replace your oncologist or clinical diagnosis.
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedCategory === cat
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      {filteredReports.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((report) => {
            const hasAnalysis = Boolean(report.analysis_data || report.notes);
            const a = report.analysis_data || {};
            const cancerType = a.reportOverview?.cancerType;
            const docType = report.document_type || a.documentType || report.category;

            return (
              <div
                key={report.id}
                className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
                      {report.file_type === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900">
                        {report.category}
                      </span>
                      <button
                        onClick={() => handleDeleteReport(report.id, report.title)}
                        title="Delete report"
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {report.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-500">
                    <span>{docType}</span>
                    {report.doctor && <span>• Dr: {report.doctor}</span>}
                  </div>

                  {cancerType && cancerType !== 'Not explicitly stated in this document' && (
                    <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-900/60">
                      <span>🎗️ {cancerType}</span>
                      {a.reportOverview?.stageOrGrade && (
                        <span>({a.reportOverview.stageOrGrade})</span>
                      )}
                    </div>
                  )}

                  {report.notes && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 line-clamp-3">
                      "{report.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span>📅 {report.date}</span>
                    <span>{report.file_size || 'Document'}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => openAnalysis(report)}
                      className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> View Analysis & Plan
                    </button>

                    <button
                      onClick={() => openChatWithReport(report)}
                      title="Ask AI Assistant about this report"
                      className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-300 hover:bg-sky-100 border border-sky-200/60 dark:border-sky-800/60 transition-colors"
                    >
                      <Bot className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
          <FileText className="w-12 h-12 text-indigo-300 dark:text-indigo-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Medical Reports Uploaded Yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Upload your biopsy, pathology, CBC blood work, or imaging report in PDF or image format. The AI will extract clinical findings and formulate your personalized nutrition, hydration, and movement plan.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-5 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all inline-flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" /> Upload Document / Scan Now
          </button>
        </div>
      )}

      {/* Upload & Analysis Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[92vh] overflow-y-auto my-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-500" /> Upload & Analyze Report
              </h2>
              <button
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <Trash2 className="w-4 h-4 hidden" />
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Extract findings, translate medical terms, and generate personalized nutrition & wellness plan
            </p>

            {uploadError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Error:</span> {uploadError}
                </div>
              </div>
            )}

            {uploading ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-14 h-14 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                    Analyzing Medical Report
                  </h3>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1 font-semibold animate-pulse">
                    {uploadProgressStep || 'Processing document text...'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-3 max-w-xs mx-auto">
                    Verifying tumor markers, cross-referencing clinical safety guidelines, and preparing supportive routines.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleAnalyzeAndUpload} className="space-y-4 text-xs">
                {/* Mode Selector: File Upload vs Text Paste */}
                <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1">
                  <button
                    type="button"
                    onClick={() => { setUploadTab('file'); setUploadError(null); }}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                      uploadTab === 'file' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    📄 PDF / Image Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => { setUploadTab('text'); setUploadError(null); }}
                    className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                      uploadTab === 'text' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    📝 Paste Report Text
                  </button>
                </div>

                {uploadTab === 'file' ? (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Report File (PDF, PNG, JPG)
                    </label>
                    <label className={`
                      p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all
                      ${selectedFile 
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30' 
                        : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 bg-slate-50/60 dark:bg-slate-800/40'}
                    `}>
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <UploadCloud className="w-8 h-8 text-indigo-500 mb-2" />
                      {selectedFile ? (
                        <div className="text-center">
                          <span className="font-bold text-slate-800 dark:text-slate-100 block">{selectedFile.name}</span>
                          <span className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for analysis</span>
                        </div>
                      ) : (
                        <div className="text-center">
                          <span className="font-semibold text-slate-700 dark:text-slate-200 block">Click or Drag & Drop PDF / Scan</span>
                          <span className="text-[10px] text-slate-400">Supports PDF, PNG, JPG, WebP (Up to 20MB)</span>
                        </div>
                      )}
                    </label>
                  </div>
                ) : (
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Paste Electronic Lab / Pathology Text
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Paste text from MyChart, Quest, Labcorp, or hospital portal notes..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono text-xs"
                    />
                  </div>
                )}

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Surgical Pathology Biopsy or CBC Panel"
                    value={newReportMeta.title}
                    onChange={(e) => setNewReportMeta({ ...newReportMeta, title: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                    <select
                      value={newReportMeta.category}
                      onChange={(e) => setNewReportMeta({ ...newReportMeta, category: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    >
                      <option>Pathology</option>
                      <option>Blood Work</option>
                      <option>Scans & Imaging</option>
                      <option>Prescriptions</option>
                      <option>Discharge Summary</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Provider / Doctor</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Sarah Lin"
                      value={newReportMeta.doctor}
                      onChange={(e) => setNewReportMeta({ ...newReportMeta, doctor: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                    />
                  </div>
                </div>

                {/* Optional Patient Context Accordion */}
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 space-y-2.5">
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 block">
                    Optional Clinical Context (Helps personalize recommendations):
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Diet Preference</span>
                      <select
                        value={newReportMeta.dietPreference}
                        onChange={(e) => setNewReportMeta({ ...newReportMeta, dietPreference: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option>Non-Vegetarian</option>
                        <option>Vegetarian</option>
                        <option>Vegan</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block mb-0.5">Kidney/Heart Issue?</span>
                      <select
                        value={newReportMeta.hasKidneyOrHeart}
                        onChange={(e) => setNewReportMeta({ ...newReportMeta, hasKidneyOrHeart: e.target.value })}
                        className="w-full p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                      >
                        <option value="No">No restriction</option>
                        <option value="Kidney">Kidney condition</option>
                        <option value="Heart">Heart condition</option>
                        <option value="Both">Both / Fluid restriction</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Current treatment (e.g. Chemo Cycle 2, Radiation, Post-surgery)"
                      value={newReportMeta.treatment}
                      onChange={(e) => setNewReportMeta({ ...newReportMeta, treatment: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold text-slate-700 dark:text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-md flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" /> Start AI Analysis
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Comprehensive Report Analysis Modal */}
      <ReportAnalysisModal
        report={activeAnalysisReport}
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
        onUpdateContext={handleUpdateContext}
      />
    </div>
  );
};
