import React, { useState, useEffect, useRef } from 'react';
import { Bot, Loader2, Send, Sparkles, ExternalLink } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { careerChatReply } from '../../services/aiService';

type Message = { role: 'bot' | 'user'; text: string };

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.trim() === '') return <div key={i} className="h-1" />;
    if (/^[•*-] /.test(line)) {
      const parts = line.slice(2).split(/\*\*(.*?)\*\*/g);
      return (
        <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
          <span className="shrink-0 text-primary-500 mt-0.5">•</span>
          <span>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</span>
        </p>
      );
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
  });
}

const QUICK_PROMPTS = ['How do I find internships?', 'Resume writing tips', 'Interview preparation', 'Top skills to learn in 2026'];

export const AiHelpPage: React.FC = () => {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [aiName, setAiName] = useState('AI Help Assistant');
  const [configLoading, setConfigLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system_config', 'ai_help'),
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        setEmbedUrl(data?.embedUrl?.trim() || null);
        setAiName(data?.aiName || 'AI Help Assistant');
        setConfigLoading(false);
      },
      () => setConfigLoading(false)
    );
    return () => unsub();
  }, []);

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  // URL is configured → just open it in an iframe, full page
  if (embedUrl) {
    return (
      <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
        <iframe
          src={embedUrl}
          title={aiName}
          className="flex-1 w-full border-0"
          allow="microphone; camera; clipboard-read; clipboard-write; fullscreen"
        />
        <div className="flex items-center justify-end px-3 py-1.5 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <a href={embedUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-primary-500 hover:text-primary-600 font-medium flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> Open in new tab
          </a>
        </div>
      </div>
    );
  }

  // No URL → built-in AI chat
  return <BuiltInChat aiName={aiName} />;
};

const BuiltInChat: React.FC<{ aiName: string }> = ({ aiName }) => {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'bot',
    text: `Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Finding and applying for internships\n• Resume writing and ATS optimization\n• Interview preparation (DSA, system design, HR)\n• Career roadmaps and skill building\n\nWhat would you like help with today?`,
  }]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const sendMessage = async (text?: string) => {
    const msg = (text ?? inputText).trim();
    if (!msg || typing) return;
    setInputText('');
    setError('');
    const updated: Message[] = [...messages, { role: 'user', text: msg }];
    setMessages(updated);
    setTyping(true);
    try {
      const reply = await careerChatReply(msg, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const m = err?.message || '';
      setError(m.includes('No API key') ? 'AI not configured — ask admin to set an API key in Admin → AI Settings.' : `Error: ${m}`);
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, could not respond right now. Please try again.' }]);
    } finally {
      setTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] -m-4 lg:-m-6">
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{aiName}</p>
          <p className="text-xs text-gray-400">AI Career Advisor · STUNIVOZ</p>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50 dark:bg-gray-950/50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' && (
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary-500 text-white rounded-tr-sm' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-tl-sm'}`}>
              {msg.role === 'user' ? <p className="text-sm leading-relaxed">{msg.text}</p> : <div className="space-y-1">{formatMessage(msg.text)}</div>}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center">
                {[0, 150, 300].map(d => <span key={d} className="w-2 h-2 bg-gray-300 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
              </div>
            </div>
          </div>
        )}
        {error && <div className="mx-auto max-w-sm p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-600 dark:text-red-400 text-center">{error}</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        {QUICK_PROMPTS.map(p => (
          <button key={p} onClick={() => sendMessage(p)} className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 hover:text-primary-600 dark:hover:text-primary-400 rounded-full transition-colors font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> {p}
          </button>
        ))}
      </div>

      <div className="p-3 flex gap-2 items-center border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex-shrink-0">
        <input ref={inputRef} value={inputText} onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
          placeholder="Ask about internships, resume, interviews..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition-all" />
        <button onClick={() => sendMessage()} disabled={!inputText.trim() || typing}
          className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-sm flex-shrink-0">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
