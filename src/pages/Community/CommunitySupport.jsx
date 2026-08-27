import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Users, Plus, Heart, Flag, MessageCircle, ShieldCheck, Sparkles } from 'lucide-react';

export const CommunitySupport = () => {
  const { addToast } = useTheme();

  const [posts, setPosts] = useState([]);
  const [showPostModal, setShowPostModal] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('All');

  const [newPost, setNewPost] = useState({
    topic: 'Chemotherapy Tips',
    content: ''
  });

  useEffect(() => {
    fetch('/api/community')
      .then(res => res.json())
      .then(data => setPosts(data))
      .catch(() => {
        setPosts([
          { id: 'com-1', author: 'WarriorGrace22', date: '2026-08-04', topic: 'Chemotherapy Tips', content: 'Warm ginger tea and small saltine crackers before getting out of bed helped so much with morning chemo nausea today. Sending strength to everyone fighting!', hugs: 24, replies: 6 },
          { id: 'com-2', author: 'HopefulJourney', date: '2026-08-03', topic: 'Emotional Wellness', content: 'Finished my last radiation session today! Ringing the bell felt surreal. To anyone starting out: take it one single day at a time, you are stronger than you know.', hugs: 48, replies: 12 },
          { id: 'com-3', author: 'CaregiverDan', date: '2026-08-02', topic: 'Caregiver Support', content: 'As a caregiver, how do you handle your own emotional burnout while staying positive for your partner? Looking for encouraging advice.', hugs: 15, replies: 8 }
        ]);
      });
  }, []);

  const handleHug = (id) => {
    setPosts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, hugs: p.hugs + 1 };
      }
      return p;
    }));

    addToast('Encouragement Sent', 'You sent a hug of support!', 'success');
    fetch(`/api/community/${id}/hug`, { method: 'POST' }).catch(() => {});
  };

  const handleFlag = (id) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    addToast('Content Flagged', 'Post reported for admin moderation review.', 'warning');
    fetch(`/api/community/${id}/flag`, { method: 'POST' }).catch(() => {});
  };

  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!newPost.content.trim()) return;

    const postToAdd = {
      id: 'com-' + Date.now(),
      author: 'Anonymous Fighter',
      date: new Date().toISOString().split('T')[0],
      topic: newPost.topic,
      content: newPost.content,
      hugs: 1,
      replies: 0
    };

    setPosts(prev => [postToAdd, ...prev]);
    setShowPostModal(false);
    setNewPost({ topic: 'Chemotherapy Tips', content: '' });
    addToast('Post Published', 'Your anonymous post is live in the community forum.', 'success');

    fetch('/api/community', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postToAdd)
    }).catch(() => {});
  };

  const topics = ['All', 'Chemotherapy Tips', 'Emotional Wellness', 'Caregiver Support', 'Nutrition & Appetite'];

  const filteredPosts = selectedTopic === 'All'
    ? posts
    : posts.filter(p => p.topic === selectedTopic);

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-8 h-8 text-sky-500" /> Anonymous Community Support
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Safe, empathetic space to share experiences, offer encouragement, and ask questions
          </p>
        </div>

        <button
          onClick={() => setShowPostModal(true)}
          className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Share Post / Story
        </button>
      </div>

      {/* Safety & Anonymity Banner */}
      <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200/80 dark:border-sky-800/60 flex items-center gap-3 text-sky-900 dark:text-sky-200 text-xs">
        <ShieldCheck className="w-5 h-5 text-sky-500 flex-shrink-0" />
        <span>
          <strong>ANONYMOUS & MODERATED:</strong> All user posts are protected by privacy safeguards. Inappropriate content or unverified medical claims can be flagged for immediate admin review.
        </span>
      </div>

      {/* Topic Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTopic(t)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedTopic === t
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel hover:shadow-pastelHover transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-sky-400 flex items-center justify-center text-white font-bold text-xs">
                  {post.author[0]}
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{post.author}</span>
                  <span className="text-[10px] text-slate-400 block">{post.date}</span>
                </div>
              </div>

              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300">
                {post.topic}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed my-3">
              {post.content}
            </p>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleHug(post.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 font-semibold hover:bg-purple-100 transition-colors"
                >
                  <Heart className="w-4 h-4 fill-purple-400" />
                  <span>Send Hug ({post.hugs})</span>
                </button>

                <span className="text-slate-400 flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" /> {post.replies} Replies
                </span>
              </div>

              <button
                onClick={() => handleFlag(post.id)}
                title="Report Post"
                className="text-slate-400 hover:text-rose-500 p-1.5 rounded-xl transition-colors"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-1">
              Create Anonymous Post
            </h2>
            <p className="text-xs text-slate-500 mb-4">Share your progress, tips, or ask for emotional support</p>

            <form onSubmit={handleCreatePost} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Topic Category</label>
                <select
                  value={newPost.topic}
                  onChange={(e) => setNewPost({ ...newPost, topic: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                >
                  <option>Chemotherapy Tips</option>
                  <option>Emotional Wellness</option>
                  <option>Caregiver Support</option>
                  <option>Nutrition & Appetite</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Your Message / Story</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Share what helped you today or ask a question..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPostModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 text-white font-semibold shadow-md"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
