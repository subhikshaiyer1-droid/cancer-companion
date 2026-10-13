import React, { useState, useRef, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { supabase } from '../../lib/supabase';
import {
  Bot,
  Send,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Volume2,
  RefreshCw,
  FileText,
  X,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const AIAssistant = () => {
  const { user } = useAuth();
  const { speakText, addToast } = useTheme();
  const location = useLocation();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello, I am your Cancer Companion AI. I'm here to answer questions, explain medical terms, and offer emotional support. How are you feeling today?",
      time: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);

  // Active Report Context state
  const [activeReport, setActiveReport] = useState(location.state?.report || null);
  const [userReports, setUserReports] = useState([]);

  const [medicalTermInput, setMedicalTermInput] = useState('');
  const [termDefinition, setTermDefinition] = useState(null);

  const [doctorQuestionsCategory, setDoctorQuestionsCategory] = useState('general');
  const [doctorQuestions, setDoctorQuestions] = useState([]);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load user reports for context selector
  useEffect(() => {
    if (!user || !supabase) return;
    const fetchReports = async () => {
      try {
        const { data } = await supabase
          .from('health_reports')
          .select('id, title, category, date, document_type, analysis_data')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);
        if (data) setUserReports(data);
      } catch (e) {
        console.warn('Could not load reports for AI assistant selector', e);
      }
    };
    fetchReports();
  }, [user]);

  // Check if routed with report
  useEffect(() => {
    if (location.state?.report) {
      setActiveReport(location.state.report);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          sender: 'ai',
          text: `I see you've loaded your report: "${location.state.report.title || location.state.report.fileName || 'Medical Report'}". I have reviewed its verified clinical findings. Feel free to ask me to explain any terms, lab values, nutrition recommendations, or questions to ask your oncologist.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [location.state]);

  const questionsMap = {
    general: [
      "What specific type and stage of cancer do I have?",
      "What are the goals of my recommended treatment plan?",
      "What are potential side effects, and how can we manage them at home?",
      "Who should I call if I experience urgent symptoms outside clinic hours?"
    ],
    report: [
      "Can you explain the main findings in my uploaded report?",
      "What do my tumor markers or laboratory results indicate?",
      "What nutrition suggestions are recommended for my condition?",
      "What questions should I ask my oncologist about this report?"
    ],
    chemotherapy: [
      "How many cycles of chemotherapy are planned?",
      "What anti-nausea medications will be prescribed before infusion?",
      "What signs of infection or fever should trigger an emergency call?",
      "How will chemotherapy affect my energy levels and daily routine?"
    ],
    radiation: [
      "How many total radiation sessions will I need?",
      "What skin care precautions should I take on the targeted area?",
      "Will radiation cause fatigue, and when is it most pronounced?",
      "What long-term follow-up imaging will be required after radiation?"
    ],
    surgery: [
      "What is the expected surgical procedure and hospital stay length?",
      "What drains or surgical dressings will I have post-operation?",
      "How soon can I resume normal physical activities?",
      "When will the pathology report from the surgery be ready?"
    ]
  };

  const termDict = {
    neutropenia: "Neutropenia is a lower-than-normal level of neutrophils (a type of white blood cell) that help fight bacterial infections.",
    biopsy: "A procedure to remove a small sample of tissue or cells so it can be examined under a microscope by a pathologist.",
    portacath: "A small medical device implanted under the skin to make drawing blood or giving IV treatments and chemotherapy easier.",
    remission: "A decrease in or disappearance of signs and symptoms of cancer. It can be partial or complete.",
    oncologist: "A doctor who specializes in diagnosing and treating people with cancer.",
    chemotherapy: "Treatment using anti-cancer drugs designed to destroy or slow the growth of rapidly dividing cells.",
    radiation: "High-energy beams (like X-rays) used to destroy cancer cells and shrink tumors in specific targeted areas.",
    mucositis: "Inflammation or ulceration of the mucous membranes lining the digestive tract, commonly causing mouth sores.",
    adenocarcinoma: "Cancer that develops in the mucus-secreting glands of organs such as the lung, breast, prostate, or colon."
  };

  useEffect(() => {
    setDoctorQuestions(questionsMap[doctorQuestionsCategory] || questionsMap.general);
  }, [doctorQuestionsCategory]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    const messageToSend = inputText.trim();
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    const messagesPayload = messages
      .filter(m => m.text && m.text.trim().length > 0)
      .map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
    messagesPayload.push({ role: 'user', content: messageToSend });

    let reportContextPayload = null;
    if (activeReport) {
      const a = activeReport.analysis_data || activeReport.analysis || activeReport;
      reportContextPayload = {
        fileName: activeReport.title || activeReport.fileName || 'Patient Report',
        documentType: a?.documentType || activeReport.category || 'Medical Report',
        cancerType: a?.reportOverview?.cancerType || 'Not specified',
        stageOrGrade: a?.reportOverview?.stageOrGrade || 'Not specified',
        keyFindings: a?.keyMedicalFindings || [],
        summary: a?.reportOverview?.summary || activeReport.notes || ''
      };
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messagesPayload,
          reportContext: reportContextPayload
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data.message;
      if (!aiReply || !aiReply.trim()) {
        throw new Error("The AI provider returned an empty response. Please try rephrasing your message.");
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (error) {
      console.error('AI Chat Error:', error.message);
      let errorMessage = error.message || "I'm having trouble connecting to my service right now. Please try again in a moment.";

      if (error.message?.includes('OPENROUTER_API_KEY') || error.message?.includes('not configured')) {
        errorMessage = "The AI service is not configured. Please ensure OPENROUTER_API_KEY is set in your environment variables.";
      } else if (error.message?.includes('not authorized') || error.message?.includes('401') || error.message?.includes('403')) {
        errorMessage = "The AI service is not authorized right now. Please check the OPENROUTER_API_KEY in your deployment environment settings.";
      } else if (error.message?.includes('busy') || error.message?.includes('rate-limited') || error.message?.includes('429')) {
        errorMessage = "The AI service is temporarily busy or rate-limited. Please wait a moment and try again.";
      } else if (error.message?.includes('timeout') || error.message?.includes('504')) {
        errorMessage = "The request took longer than expected to process. Please try asking again.";
      }

      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: errorMessage,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);

      if (addToast) {
        addToast("Chat Notice", errorMessage, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const explainTerm = () => {
    if (!medicalTermInput.trim()) return;
    const key = medicalTermInput.trim().toLowerCase();
    if (termDict[key]) {
      setTermDefinition(termDict[key]);
    } else {
      setTermDefinition(`${medicalTermInput}: Medical term relating to diagnosis or treatment. Please discuss with your primary oncologist for full details.`);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bot className="w-8 h-8 text-sky-500" /> AI Health Assistant
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Empathetic guidance, report explanation, medical term simplifier, and oncology questions
          </p>
        </div>

        {/* Report Context Selector Dropdown */}
        {userReports.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={activeReport?.id || ''}
              onChange={(e) => {
                const found = userReports.find(r => r.id === e.target.value);
                setActiveReport(found || null);
                if (found) {
                  addToast?.('Report Context Active', `AI Assistant linked to: ${found.title}`, 'info');
                }
              }}
              className="text-xs py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm"
            >
              <option value="">No Active Report Context</option>
              {userReports.map(r => (
                <option key={r.id} value={r.id}>
                  📄 {r.title} ({r.category})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Mandatory Safety & Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3 text-amber-800 dark:text-amber-200">
        <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold">MEDICAL SAFETY DISCLAIMER:</span> Information provided by this AI Assistant is for educational & emotional support only. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or emergency treatment. For urgent symptoms (e.g. fever during chemotherapy, severe shortness of breath, uncontrolled bleeding), contact your doctor or emergency services immediately.
        </div>
      </div>

      {/* Active Report Badge Banner (if a report is loaded) */}
      {activeReport && (
        <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3 text-indigo-900 dark:text-indigo-200 animate-fade-in">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
              <FileText className="w-4 h-4" />
            </div>
            <div className="text-xs truncate">
              <span className="font-bold">Active Report Context:</span>{' '}
              <span className="font-medium">{activeReport.title || activeReport.fileName}</span>{' '}
              <span className="text-[11px] text-indigo-500 dark:text-indigo-400">
                • {activeReport.category || activeReport.documentType || 'Clinical Document'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/reports"
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:underline flex items-center gap-1"
            >
              View Report
            </Link>
            <button
              onClick={() => setActiveReport(null)}
              title="Clear report context"
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Chatbot Window + Helper Utilities Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Window */}
        <div className="lg:col-span-2 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 flex flex-col h-[600px] shadow-pastel">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Care Companion Assistant</h3>
                <span className="text-[11px] text-emerald-500 font-semibold flex items-center gap-1">
                  ● Secure Server API • {activeReport ? 'Report-Aware Mode' : 'Empathetic Mode'}
                </span>
              </div>
            </div>

            {activeReport && (
              <button
                onClick={() => setDoctorQuestionsCategory('report')}
                className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-purple-500" /> Report Questions
              </button>
            )}
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`
                  max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm relative group
                  ${msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-tr-none'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/70 dark:border-slate-700/70 rounded-tl-none'
                  }
                `}>
                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Read aloud button for AI messages */}
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => speakText(msg.text)}
                      title="Read aloud"
                      className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-500 hover:text-sky-600"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 p-3 text-xs text-slate-400">
                <RefreshCw className="w-4 h-4 animate-spin text-sky-500" />
                Companion is reflecting and crafting a calm, safe response...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder={activeReport ? `Ask questions about ${activeReport.title || 'your report'}...` : "Ask about symptoms, medical terms, emotional support..."}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50 transition-colors shadow-md shadow-sky-600/20"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Sidebar Tools: Medical Terms Explainer & Doctor Questions Generator */}
        <div className="space-y-6">
          {/* Medical Term Simplifier Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel">
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Simple Term Explainer</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Type any medical jargon (e.g. <i>neutropenia, biopsy, portacath, mucositis</i>) for a clear explanation:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter medical term..."
                value={medicalTermInput}
                onChange={(e) => setMedicalTermInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs bg-slate-50 dark:bg-slate-800"
              />
              <button
                onClick={explainTerm}
                className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
              >
                Explain
              </button>
            </div>

            {termDefinition && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 leading-relaxed animate-fade-in">
                {termDefinition}
              </div>
            )}
          </div>

          {/* Doctor Question Suggestions Card */}
          <div className="p-6 rounded-3xl glass-card border border-slate-200/80 dark:border-slate-800 shadow-pastel">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-purple-500" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Questions to Ask Doctor</h3>
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {['general', ...(activeReport ? ['report'] : []), 'chemotherapy', 'radiation', 'surgery'].map((phase) => (
                <button
                  key={phase}
                  onClick={() => setDoctorQuestionsCategory(phase)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-colors ${
                    doctorQuestionsCategory === phase
                      ? 'bg-purple-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {phase}
                </button>
              ))}
            </div>

            <ul className="space-y-2">
              {doctorQuestions.map((q, idx) => (
                <li
                  key={idx}
                  onClick={() => setInputText(q)}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 cursor-pointer transition-colors"
                >
                  " {q} "
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
