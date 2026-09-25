import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { FileText, UploadCloud, Download, Image as ImageIcon, Eye, Calendar, Tag, Plus, Check } from 'lucide-react';

export const HealthReports = () => {
  const { addToast } = useTheme();

  const [reports, setReports] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [newReport, setNewReport] = useState({
    title: '',
    category: 'Blood Work',
    doctor: 'Dr. Sarah Lin',
    notes: ''
  });

  const categories = ['All', 'Blood Work', 'Scans & Imaging', 'Pathology', 'Prescriptions'];

  const filteredReports = selectedCategory === 'All'
    ? reports
    : reports.filter(r => r.category === selectedCategory);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!newReport.title) return;

    const reportToAdd = {
      id: 'rep-' + Date.now(),
      date: new Date().toISOString().split('T')[0],
      fileType: 'pdf',
      fileSize: '1.5 MB',
      ...newReport
    };

    setReports(prev => [reportToAdd, ...prev]);
    setShowUploadModal(false);
    addToast('Report Uploaded', `${reportToAdd.title} saved securely under ${reportToAdd.category}.`, 'success');
  };

  const simulateDownload = (title) => {
    addToast('Downloading File', `Starting secure download for ${title}...`, 'info');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-500" /> Health Reports & Scans
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Store and organize lab blood work, PET/CT scan images, and pathology reports
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 transition-all flex items-center gap-2"
        >
          <UploadCloud className="w-4 h-4" /> Upload Document / Scan
        </button>
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
          {filteredReports.map((report) => (
            <div
              key={report.id}
              className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">
                    {report.fileType === 'image' ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {report.category}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-snug">{report.title}</h3>
                <p className="text-xs text-slate-500 mt-1">Provider: {report.doctor}</p>

                {report.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                    "{report.notes}"
                  </p>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">📅 {report.date} • {report.fileSize}</span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => simulateDownload(report.title)}
                    title="Download File"
                    className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-sky-100 hover:text-sky-600 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Reports Uploaded</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            You haven't added any lab results or scans yet. Click "Upload Document" to store your records securely.
          </p>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Upload Health Report / Scan
            </h2>
            <p className="text-xs text-slate-500 mb-4">Attach PDF medical records or image scans</p>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CBC Blood Work Panel"
                  value={newReport.title}
                  onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Category</label>
                <select
                  value={newReport.category}
                  onChange={(e) => setNewReport({ ...newReport, category: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option>Blood Work</option>
                  <option>Scans & Imaging</option>
                  <option>Pathology</option>
                  <option>Prescriptions</option>
                </select>
              </div>

              {/* Simulated File Upload Drag Area */}
              <div className="p-6 rounded-2xl border-2 border-dashed border-sky-300 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 text-center cursor-pointer">
                <UploadCloud className="w-8 h-8 text-sky-500 mx-auto mb-2" />
                <span className="text-xs font-semibold text-sky-700 dark:text-sky-300 block">Click or Drag & Drop PDF / Scan Image</span>
                <span className="text-[10px] text-slate-400">Supports PDF, PNG, JPG (Up to 15MB)</span>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold shadow-md"
                >
                  Save & Store Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
