import React, { useState, useEffect } from 'react';

import { useTheme } from '../../context/ThemeContext';
import { ShieldCheck, Users, Flag, FilePlus, BarChart2, CheckCircle, Trash2, Eye } from 'lucide-react';

export const AdminPanel = () => {
  const { addToast } = useTheme();

  const [stats, setStats] = useState({
    totalUsers: 148,
    activePatients: 132,
    activeCaregivers: 16,
    totalLogsCount: 540,
    communityPostsCount: 42,
    flaggedPostsCount: 2,
    medicationAdherenceRate: '88%'
  });

  const [flaggedPosts, setFlaggedPosts] = useState([
    { id: 'com-flag-1', author: 'User99', topic: 'Chemotherapy Tips', content: 'Unverified miracle cure seller message...', flaggedReason: 'Unverified medical claim' }
  ]);

  const [articleTitle, setArticleTitle] = useState('');
  const [articleBody, setArticleBody] = useState('');

  const approveFlagged = (id) => {
    setFlaggedPosts(prev => prev.filter(p => p.id !== id));
    addToast('Content Approved', 'Post reviewed and cleared.', 'success');
  };

  const removeFlagged = (id) => {
    setFlaggedPosts(prev => prev.filter(p => p.id !== id));
    addToast('Content Deleted', 'Inappropriate post deleted from platform.', 'warning');
  };

  const handlePublishArticle = (e) => {
    e.preventDefault();
    if (!articleTitle || !articleBody) return;
    addToast('Article Published', `Health Guide "${articleTitle}" is now live for all patients.`, 'success');
    setArticleTitle('');
    setArticleBody('');
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-purple-600" /> Admin & Moderation Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform governance, community moderation, user management & educational CMS
          </p>
        </div>
      </div>

      {/* Analytics Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Total Patients</span>
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-1 block">{stats.totalUsers}</span>
        </div>
        <div className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Adherence Rate</span>
          <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{stats.medicationAdherenceRate}</span>
        </div>
        <div className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Community Posts</span>
          <span className="text-2xl font-extrabold text-sky-600 mt-1 block">{stats.communityPostsCount}</span>
        </div>
        <div className="p-5 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Flagged Queue</span>
          <span className="text-2xl font-extrabold text-amber-500 mt-1 block">{flaggedPosts.length}</span>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <Flag className="w-5 h-5 text-amber-500" /> Community Moderation Queue
        </h3>

        {flaggedPosts.length === 0 ? (
          <p className="text-xs text-slate-500 py-4">No pending reported posts in queue.</p>
        ) : (
          <div className="space-y-3">
            {flaggedPosts.map((post) => (
              <div key={post.id} className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-100">Author: {post.author}</span>
                  <p className="text-slate-600 dark:text-slate-300 mt-1">"{post.content}"</p>
                  <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Reason: {post.flaggedReason}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveFlagged(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button
                    onClick={() => removeFlagged(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-semibold text-xs flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Publish Health Article CMS */}
      <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
          <FilePlus className="w-5 h-5 text-purple-600" /> Publish Verified Health Article
        </h3>

        <form onSubmit={handlePublishArticle} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Article Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Navigating Chemo-Brain and Cognitive Recovery"
              value={articleTitle}
              onChange={(e) => setArticleTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Article Body Content</label>
            <textarea
              rows="4"
              required
              placeholder="Write verified medical advice with oncologist review tag..."
              value={articleBody}
              onChange={(e) => setArticleBody(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
            />
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md"
          >
            Publish Article to Patient App
          </button>
        </form>
      </div>
    </div>
  );
};
