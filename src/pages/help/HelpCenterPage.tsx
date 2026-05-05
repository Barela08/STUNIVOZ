import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Mail, MessageCircle } from 'lucide-react';

const faqs = [
  {
    q: 'STUNIVOZ kya hai?',
    a: 'STUNIVOZ ek complete career development platform hai jo college students ke liye banaya gaya hai. Yahan aap internships dhundh sakte hain, resume bana sakte hain, courses kar sakte hain, aur apni career progress track kar sakte hain.',
  },
  {
    q: 'Kya STUNIVOZ free hai?',
    a: 'Haan! STUNIVOZ students ke liye bilkul free hai. Sabhi basic features jaise internship browsing, resume builder, courses, aur events bilkul free hain.',
  },
  {
    q: 'Resume builder mein kya features hain?',
    a: 'Hamare AI-powered resume builder se aap ATS-friendly resume bana sakte hain, existing resume upload kar sakte hain (PDF/image), aur instant ATS score pa sakte hain. Resume PDF mein download bhi ho sakta hai.',
  },
  {
    q: 'Internship ke liye apply kaise karein?',
    a: 'Internships page par jaiye, apni pasand ki internship dhundhe, aur "Apply Now" button click karein. Aapko company ki website par redirect kiya jayega.',
  },
  {
    q: 'AI Help page kaise use karein?',
    a: 'AI Help section mein admin dwara configure kiya gaya AI assistant milega. Wahan aap career, resume, ya internship se related koi bhi sawaal pooch sakte hain.',
  },
  {
    q: 'Account kaise delete karein?',
    a: 'Settings > Account section mein jaake aap apna account delete kar sakte hain. Agar help chahiye to support se contact karein.',
  },
  {
    q: 'Password bhool gaya, reset kaise karein?',
    a: 'Login page par "Forgot Password?" link click karein. Aapke email par reset link bheja jayega.',
  },
  {
    q: 'Company profile kaise banayein?',
    a: 'Agar aap internship post karna chahte hain, to Provider section mein register karein. Admin approval ke baad aap internships aur events post kar sakte hain.',
  },
];

const FAQ: React.FC<{ q: string; a: string }> = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between p-5 text-left bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <span className="font-semibold text-gray-900 dark:text-white pr-4">{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-primary-500 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 bg-white dark:bg-gray-900">
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

export const HelpCenterPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-10 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
          <HelpCircle className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Help Center</h1>
        <p className="text-gray-500 dark:text-gray-400">Sab kuch jaanein STUNIVOZ ke baare mein</p>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Aksar Puche Jane Wale Sawaal (FAQ)</h2>
        <div className="space-y-3">
          {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-900/10 rounded-2xl p-8 text-center border border-primary-200 dark:border-primary-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aur Madad Chahiye?</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Humse directly contact karein — hum help karne ke liye hamesha ready hain.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:support@stunivoz.com"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-semibold hover:bg-primary-700 transition-colors text-sm"
          >
            <Mail className="w-4 h-4" />
            Email Support
          </a>
          <a
            href="https://wa.me/917414935405?text=Hi%2C%20I%20need%20help%20with%20STUNIVOZ"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white rounded-xl font-semibold hover:bg-[#1ebe5d] transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            WhatsApp Support
          </a>
        </div>
      </div>
    </div>
  );
};
