import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { GitCommit, CheckCircle2, Clock, Calendar, Sparkles, Award } from 'lucide-react';

export const TreatmentTimeline = () => {
  const { profile } = useAuth();
  const [timeline, setTimeline] = useState([]);
  const [filterPhase, setFilterPhase] = useState('All');

  useEffect(() => {
    // Generate initial milestone from user profile if available
    const items = [];
    if (profile?.diagnosis_date) {
      items.push({
        id: 'diag-1',
        phase: 'Diagnosis',
        title: `${profile.cancer_type || 'Cancer'} Diagnosis`,
        date: profile.diagnosis_date,
        description: `Diagnosed with ${profile.cancer_type || 'Cancer'}${profile.cancer_stage ? ` (${profile.cancer_stage})` : ''} at ${profile.hospital || 'Medical Center'}. Primary Doctor: ${profile.doctor_name || 'Oncologist'}.`,
        status: 'completed'
      });
    }
    setTimeline(items);
  }, [profile]);

  const phases = ['All', 'Diagnosis', 'Surgery', 'Chemotherapy', 'Radiation', 'Recovery'];

  const filteredTimeline = filterPhase === 'All'
    ? timeline
    : timeline.filter(t => t.phase.toLowerCase() === filterPhase.toLowerCase());

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GitCommit className="w-8 h-8 text-sky-500" /> Treatment Timeline
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual roadmap of your diagnosis, chemotherapy, radiation, surgery & recovery milestones
          </p>
        </div>
      </div>

      {/* Phase Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setFilterPhase(phase)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              filterPhase === phase
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Vertical Timeline Card Tree */}
      {filteredTimeline.length > 0 ? (
        <div className="relative pl-6 border-l-2 border-sky-200 dark:border-sky-800 space-y-8 my-6">
          {filteredTimeline.map((item) => {
            const isCompleted = item.status === 'completed';
            const isUpcoming = item.status === 'upcoming';

            return (
              <div key={item.id} className="relative group">
                {/* Node Bullet Icon */}
                <div className={`
                  absolute -left-[35px] top-1.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110
                  ${isCompleted
                    ? 'bg-emerald-500 shadow-emerald-500/30'
                    : isUpcoming
                      ? 'bg-sky-500 ring-4 ring-sky-200 dark:ring-sky-900 shadow-sky-500/30 animate-pulse'
                      : 'bg-slate-300 dark:bg-slate-700'
                  }
                `}>
                  {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : isUpcoming ? <Clock className="w-5 h-5" /> : <Sparkles className="w-4 h-4" />}
                </div>

                {/* Event Content Card */}
                <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-300">
                        {item.phase}
                      </span>
                      <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{item.title}</h3>
                    </div>

                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {item.date}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {item.description}
                  </p>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${isCompleted ? 'text-emerald-600 dark:text-emerald-400' : isUpcoming ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'}`}>
                      Status: {item.status}
                    </span>

                    {item.phase === 'Recovery' && (
                      <span className="text-xs text-amber-500 font-semibold flex items-center gap-1">
                        <Award className="w-4 h-4" /> Milestone Target
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 px-4 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <GitCommit className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Timeline Events</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">
            Your treatment timeline will display your milestones as care details are updated.
          </p>
        </div>
      )}
    </div>
  );
};
