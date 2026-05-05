import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, Send, RefreshCw, Sparkles } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { callAI } from '../../services/aiService';

type Message = { role: 'bot' | 'user'; text: string };

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-1" />;
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      const content = line.slice(2);
      const parts = content.split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="shrink-0 text-primary-500 mt-0.5">•</span>
          <span>{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</span>
        </p>
      );
    }
    if (/^\d+\./.test(line)) {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
    }
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="text-sm font-bold text-gray-800 dark:text-gray-200 mt-1">{line.slice(2, -2)}</p>;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}</p>;
  });
}

const QUICK_PROMPTS = [
  'How do I find internships?',
  'Resume writing tips',
  'Interview preparation',
  'Top skills to learn in 2026',
  'Career roadmap advice',
];

export const AiHelpPage: React.FC = () => {
  const [aiName, setAiName] = useState<string>('AI Help Assistant');
  const [configLoading, setConfigLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ref = doc(db, 'system_config', 'ai_help');
    const unsub = onSnapshot(ref,
      (snap) => {
        if (snap.exists()) {
          setAiName(snap.data()?.aiName || 'AI Help Assistant');
        }
        setConfigLoading(false);
      },
      () => setConfigLoading(false)
    );
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!configLoading) {
      setMessages([{
        role: 'bot',
        text: `Hi! I'm ${aiName} 👋\n\nI can help you with:\n• Finding and applying for internships\n• Resume writing and ATS optimization\n• Interview preparation (DSA, system design, HR)\n• Career roadmaps and skill building\n• Salary and stipend benchmarks\n\nWhat would you like to know?`,
      }]);
    }
  }, [configLoading, aiName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async () => {
    const text = inputText.trim();
    if (!text || typing) return;
    setInputText('');
    setError('');
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, text: m.text }));
      const historyText = history.map(m => `${m.role === 'bot' ? 'Assistant' : 'User'}: ${m.text}`).join('\n');

      const prompt = `You are ${aiName}, a helpful AI Career Advisor for STUNIVOZ, a student career development platform for Indian college students.

You help students with:
- Finding and applying for internships
- Resume writing and ATS optimization
- Interview preparation (DSA, system design, HR rounds)
- Career roadmaps and skill building
- Salary and stipend benchmarks (in Indian context)
- College-to-career transitions

Be specific, practical, and encouraging. Use Indian context (companies, stipends in ₹, Indian job portals like Internshala, LinkedIn, Naukri). Format responses with bullet points and headers where helpful. Keep responses concise but valuable (150-250 words max).

Previous conversation:
${historyText}

User: ${text}
Assistant:`;

      const reply = await callAI(prompt, 'career_chat');
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const msg = err?.message || 'Something went wrong';
      if (msg.includes('No API key')) {
        setError('AI is not configured yet. Please ask the admin to set up an AI API key in Admin → AI Settings.');
      } else {
        setError(`Error: ${msg}`);
      }
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I could not respond right now. Please try again.' }]);
    } finally {
      setTyping(false);
    }
  };

  const resetChat = () => {
    setError('');
    setMessages([{
      role: 'bot',
      text: `Hi! I'm ${aiName} 👋\n\nHow can I help you today? Ask me anything about internships, resume, interview prep, or career advice!`,
    }]);
  };

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading AI Help...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      {/* Title bar */}
      <div className="flex items-center gap-3 px-3 lg:px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <span className="flex-1 text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{aiName}</span>
        <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
        </span>
        <button
          onClick={resetChat}
          title="New conversation"
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all flex-shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl ${
              msg.role === 'user'
                ? 'bg-primary-500 text-white rounded-tr-sm'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'user'
                ? <p className="text-sm">{msg.text}</p>
                : <div className="space-y-0.5">{formatMessage(msg.text)}</div>
              }
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
              <div className="flex gap-1 items-center h-5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => { setInputText(p); }}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3" /> {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <input
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about internships, resume, interviews..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all"
        />
        <button
          onClick={sendMessage}
          disabled={!inputText.trim() || typing}
          className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
