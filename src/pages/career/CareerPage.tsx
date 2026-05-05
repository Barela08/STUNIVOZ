import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Bot, User, Loader, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '../../components/common';
import { careerChatReply } from '../../services/aiService';

type Message = { role: 'bot' | 'user'; text: string };

const FALLBACK_RESPONSES: Record<string, string> = {
  internship: "Here are tips to land your first internship:\n\n1. **Update your resume** with all projects and skills\n2. **Apply to 5–10 companies per week** — consistency matters\n3. **Use LinkedIn actively** — connect with recruiters\n4. **Practise DSA** on LeetCode (aim for Easy/Medium)\n5. **Build 2–3 solid projects** to showcase on GitHub\n\nStart applying to smaller startups first — they hire more interns and give more responsibility!",
  resume: "Here's how to write an ATS-optimized resume:\n\n• **Use keywords** from the job description\n• **Quantify achievements** — 'Improved performance by 40%' beats 'Improved performance'\n• **Keep it to 1 page** if you have less than 3 years of experience\n• **Use standard section headers** — Summary, Education, Skills, Projects, Experience\n• **Avoid tables/columns** — many ATS systems can't parse them",
  interview: "Here's how to prepare for tech interviews:\n\n**DSA (60% of interviews):**\n• LeetCode: Solve 50 Easy + 30 Medium problems\n• Focus: Arrays, Strings, Hashmaps, Trees, DP\n\n**Behavioural (HR round):**\n• Prepare STAR stories for leadership, conflict, failure\n\n**On the day:**\n• Think out loud — interviewers want to see your process\n• Ask clarifying questions before coding",
};

function getFallbackReply(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes('internship') || lower.includes('apply') || lower.includes('job')) return FALLBACK_RESPONSES.internship;
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) return FALLBACK_RESPONSES.resume;
  if (lower.includes('interview') || lower.includes('dsa') || lower.includes('coding')) return FALLBACK_RESPONSES.interview;
  return "Focus on these 3 things right now:\n\n1. **Build real projects** that solve real problems\n2. **Apply consistently** — 5+ applications per week\n3. **Learn DSA basics** to pass screening rounds\n\nWould you like specific advice on internship hunting, resume writing, or interview prep?";
}

function formatMessage(text: string) {
  return text.split('\n').map((line, i) => {
    if (!line.trim()) return <div key={i} className="h-1" />;
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-bold text-gray-800 dark:text-gray-200 mt-2 mb-0.5">{line.slice(2, -2)}</p>;
    }
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const rendered = parts.map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part);
    if (line.startsWith('• ') || line.startsWith('* ') || line.startsWith('- ')) {
      return <p key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300"><span className="shrink-0 text-primary-500 mt-0.5">•</span><span>{rendered.slice(1)}</span></p>;
    }
    if (/^\d+\./.test(line)) return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{rendered}</p>;
    return <p key={i} className="text-sm text-gray-700 dark:text-gray-300">{rendered}</p>;
  });
}

const quickQuestions = [
  'How do I get my first internship?',
  'How to write an ATS resume?',
  'How to prepare for coding interviews?',
  'Best skills to learn in 2026?',
  'How to negotiate salary?',
  'Tips for LinkedIn profile?',
];

export const CareerPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: "Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Internship hunting tips\n• Resume and ATS advice\n• Interview preparation\n• Skills to learn in 2026\n• Salary and stipend benchmarks\n\nWhat would you like to know?" },
  ]);
  const [inputText, setInputText] = useState('');
  const [typing, setTyping] = useState(false);
  const [aiError, setAiError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const sendMessage = async (overrideText?: string) => {
    const text = (overrideText ?? inputText).trim();
    if (!text || typing) return;
    setInputText('');
    setAiError('');
    const newHistory = [...messages, { role: 'user' as const, text }];
    setMessages(newHistory);
    setTyping(true);

    try {
      const reply = await careerChatReply(text, messages);
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    } catch (err: any) {
      const isNoKey = err?.message?.includes('No API key');
      const fallback = getFallbackReply(text);
      setMessages(prev => [...prev, { role: 'bot', text: fallback }]);
      if (isNoKey) {
        setAiError('Using built-in responses. Configure AI API key in Admin → AI Settings for smarter answers.');
      } else {
        setAiError(`AI unavailable: ${err?.message || 'Unknown error'}. Using fallback responses.`);
      }
    } finally {
      setTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', text: "Hi! I'm your AI Career Advisor 👋\n\nI can help you with:\n• Internship hunting tips\n• Resume and ATS advice\n• Interview preparation\n• Skills to learn in 2026\n• Salary and stipend benchmarks\n\nWhat would you like to know?" }]);
    setAiError('');
    setInputText('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 lg:-m-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 dark:text-white text-base">AI Career Advisor</h1>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Online · Ready to help
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all font-medium"
          title="Clear chat"
        >
          <X className="w-3.5 h-3.5" />
          Clear
        </button>
      </div>

      {/* AI error notice */}
      {aiError && (
        <div className="mx-4 lg:mx-6 mt-3 flex items-start gap-2 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg flex-shrink-0">
          <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-400">{aiError}</p>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-4 min-h-0 bg-gray-50 dark:bg-gray-950">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'bot' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
              {msg.role === 'bot' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'bot' ? 'bg-white dark:bg-gray-800 shadow-sm rounded-tl-none border border-gray-100 dark:border-gray-700' : 'bg-primary-500 text-white rounded-tr-none'}`}>
              {msg.role === 'bot' ? (
                <div className="space-y-0.5">{formatMessage(msg.text)}</div>
              ) : (
                <p className="text-sm text-white">{msg.text}</p>
              )}
            </div>
          </div>
        ))}

        {typing && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <Loader className="w-4 h-4 text-primary-500 animate-spin" />
              <span className="text-xs text-gray-500 dark:text-gray-400">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length === 1 && (
        <div className="px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 flex-shrink-0">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Quick questions to get started:
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="text-xs px-3 py-1.5 rounded-full bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all shadow-sm"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 lg:px-6 py-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex-shrink-0">
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your career..."
            rows={1}
            className="flex-1 px-4 py-2.5 rounded-xl border dark:border-gray-700 border-gray-200 dark:bg-gray-800 bg-gray-50 dark:text-white text-gray-900 text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!inputText.trim() || typing}
            className="w-10 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all shadow-lg shadow-primary-500/25 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-600 mt-2 text-center">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
};
