import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  Bot,
  Send,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Heart,
  Volume2,
  Mic,
  Sparkles,
  RefreshCw
} from 'lucide-react';
const openRouterApiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

export const AIAssistant = () => {
  const { speakText, addToast } = useTheme();

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

  const [medicalTermInput, setMedicalTermInput] = useState('');
  const [termDefinition, setTermDefinition] = useState(null);

  const [doctorQuestionsCategory, setDoctorQuestionsCategory] = useState('general');
  const [doctorQuestions, setDoctorQuestions] = useState([]);

  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const questionsMap = {
    general: [
      "What specific type and stage of cancer do I have?",
      "What are the goals of my recommended treatment plan?",
      "What are potential side effects, and how can we manage them at home?",
      "Who should I call if I experience urgent symptoms outside clinic hours?"
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
    radiation: "High-energy beams (like X-rays) used to destroy cancer cells and shrink tumors in specific targeted areas."
  };

  useEffect(() => {
    setDoctorQuestions(questionsMap[doctorQuestionsCategory] || questionsMap.general);
  }, [doctorQuestionsCategory]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || loading) return;

    if (!openRouterApiKey) {
      if (addToast) {
        addToast("OpenRouter API key is missing. Please add VITE_OPENROUTER_API_KEY to your .env file.", "error");
      }
      return;
    }

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

    const messagesPayload = messages.slice(1).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    }));
    messagesPayload.push({ role: 'user', content: messageToSend });

    let retries = 0;
    const maxRetries = 2;

    const makeApiCall = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), 30000);
        });

        const systemInstruction = `You are Cancer Companion, a warm, intelligent, empathetic conversational AI assistant.

Your primary purpose is to provide helpful conversation, emotional support, health education, and general assistance.

You are NOT a restricted FAQ bot.

Answer the user's actual question rather than limiting responses to predefined cancer topics.

You can discuss:
- cancer
- treatments
- chemotherapy
- radiation
- surgery
- medications in general educational terms
- medical terminology
- symptoms in general educational terms
- appointments
- questions to ask doctors
- treatment preparation
- emotional wellbeing
- anxiety
- fear
- loneliness
- stress
- coping
- motivation
- everyday conversation
- general educational questions
- normal casual conversation

If the user is emotionally distressed, respond with empathy first.
If the user says they are scared, sad, lonely, anxious, overwhelmed, or upset, acknowledge their feelings and provide supportive conversation.
Do not immediately respond with a generic medical disclaimer unless it is actually relevant.
If the user asks a normal everyday question unrelated to cancer, answer it normally.
If the user wants to have a casual conversation, converse naturally.
If the user asks a follow-up question, use the conversation context to understand what they mean.

Keep answers understandable and human.
Do not make every response excessively long.
Do not repeatedly say that you are an AI.
Do not pretend to be a doctor.
Do not diagnose the user.
Do not prescribe medication.
Do not invent medical records or patient information.

For medical questions, provide general educational information and encourage consultation with an appropriate healthcare professional when personalized medical advice is required.
For urgent or potentially life-threatening symptoms, clearly advise the user to contact emergency services or their healthcare team.

The goal is to make the user feel that they are talking with a calm, intelligent, supportive companion.`;

        const apiPromise = fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            "model": "openrouter/free",
            "messages": [
              { "role": "system", "content": systemInstruction },
              ...messagesPayload
            ]
          })
        }).then(async res => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            const err = new Error(errorData.error?.message || 'API request failed');
            err.status = res.status;
            throw err;
          }
          return res.json();
        });

        const response = await Promise.race([apiPromise, timeoutPromise]);
        
        let finalContent = "";
        
        if (response && response.choices && response.choices.length > 0) {
          let rawContent = response.choices[0].message?.content || "";
          
          // Strip OpenRouter/Llama guard safety tags or metadata if prepended
          finalContent = rawContent.replace(/^(User Safety:.*|Response Safety:.*|Reasoning:.*|Provider:.*|Usage:.*)$/gmi, '').trim();
          
          // Fallback if the content is completely empty
          if (!finalContent) {
            finalContent = "I'm here to help, but I couldn't generate a proper response. Please try asking again.";
          }
          
          const aiMsg = {
            id: Date.now() + 1,
            sender: 'ai',
            text: finalContent,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
        } else {
          throw new Error('No content in response');
        }
      } catch (error) {
        if ((error.message === 'TIMEOUT' || error?.status === 503 || error?.status === 429) && retries < maxRetries) {
          retries++;
          await makeApiCall();
        } else {
          console.error("OpenRouter API Error:", error);
          
          let errorMessage = "I'm having trouble connecting to my services right now. Please try again in a moment.";
          
          if (error.message === 'TIMEOUT') {
            errorMessage = "The response is taking longer than expected. Please try again.";
          } else if (error?.status === 503 || error?.status === 429) {
            errorMessage = "The AI service is temporarily busy. Please try again in a moment.";
          } else if (error?.status === 401 || error?.status === 403) {
            errorMessage = "The AI service is not authorized right now. Please check the AI configuration.";
          }

          const aiMsg = {
            id: Date.now() + 1,
            sender: 'ai',
            text: errorMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMsg]);
        }
      }
    };

    try {
      await makeApiCall();
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
            Empathetic guidance, medical term simplifier, and doctor question builder
          </p>
        </div>
      </div>

      {/* Mandatory Safety & Medical Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start gap-3 text-amber-800 dark:text-amber-200">
        <ShieldAlert className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs sm:text-sm leading-relaxed">
          <span className="font-bold">MEDICAL SAFETY DISCLAIMER:</span> Information provided by this AI Assistant is for educational & emotional support only. It is <strong>NOT</strong> a substitute for professional medical advice, diagnosis, or emergency treatment. For urgent symptoms, contact your doctor or call emergency services immediately.
        </div>
      </div>

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
                  ● Online • Empathetic Mode
                </span>
              </div>
            </div>
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
                Companion is reflecting and crafting a calm response...
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about side effects, medical terms, emotional support..."
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
              Type any medical jargon (e.g. <i>neutropenia, biopsy, portacath, remission</i>) for a clear explanation:
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

            <div className="flex gap-1 mb-3">
              {['general', 'chemotherapy', 'radiation', 'surgery'].map((phase) => (
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
