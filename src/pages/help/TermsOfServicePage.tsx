import React from 'react';
import { FileText } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export const TermsOfServicePage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: May 2026</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-8">
        <Section title="1. Sweekarti (Acceptance)">
          <p>
            STUNIVOZ platform ka upyog karke aap in terms of service se sahmat hote hain.
            Agar aap in terms se sahmat nahi hain, to platform ka upyog na karein.
          </p>
        </Section>

        <Section title="2. Account Zimmedari">
          <ul className="list-disc list-inside space-y-1">
            <li>Aapko accurate information deni hogi account banate samay</li>
            <li>Aapka account sirf aapke liye hai — sharing allowed nahi</li>
            <li>Account ki security ki zimmedari aapki hai</li>
            <li>Agar aapko lagta hai account compromise hua hai, turant password change karein</li>
          </ul>
        </Section>

        <Section title="3. Platform Ka Upyog">
          <p>Aap STUNIVOZ ka upyog nahi kar sakte:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Kisi bhi illegal activity ke liye</li>
            <li>Dusre users ko harass ya spam karne ke liye</li>
            <li>False ya misleading information spread karne ke liye</li>
            <li>Platform ko damage ya disrupt karne ke liye</li>
            <li>Automated bots ya scrapers run karne ke liye</li>
          </ul>
        </Section>

        <Section title="4. Content Policy">
          <p>
            Aap jo bhi content (resume, posts, reviews) upload karte hain, uskin zimmedari aapki hai.
            STUNIVOZ kisi bhi inappropriate content ko bina notice ke remove karne ka adhikaar rakhta hai.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Content hateful, violent, ya adult nahi hona chahiye</li>
            <li>Copyright material upload nahi karein</li>
            <li>Real aur authentic information hi post karein</li>
          </ul>
        </Section>

        <Section title="5. Internship Listings">
          <p>
            STUNIVOZ internship listings ke liye ek marketplace hai.
            Hum listed opportunities ki guarantee nahi dete.
            Apply karne se pehle company ki authenticity verify karein.
            Agar koi fraudulent listing mile, report karein.
          </p>
        </Section>

        <Section title="6. Intellectual Property">
          <p>
            STUNIVOZ ka naam, logo, aur branding HackifyPro ki intellectual property hai.
            Aap platform ka content personal use ke liye dekh sakte hain,
            lekin commercial use ya redistribution allowed nahi hai.
          </p>
        </Section>

        <Section title="7. Service Availability">
          <p>
            Hum 99% uptime ki koshish karte hain lekin guarantee nahi dete.
            Platform maintenance, updates, ya technical issues ke karan temporarily unavailable ho sakta hai.
          </p>
        </Section>

        <Section title="8. Liability">
          <p>
            STUNIVOZ internship placements, salary, ya career outcomes ki guarantee nahi deta.
            Platform "as is" basis par provide kiya jata hai.
            Kisi bhi loss ya damage ke liye STUNIVOZ liable nahi hoga.
          </p>
        </Section>

        <Section title="9. Account Termination">
          <p>
            Terms violate karne par hum aapka account suspend ya delete kar sakte hain bina prior notice ke.
            Aap khud bhi apna account Settings se delete kar sakte hain.
          </p>
        </Section>

        <Section title="10. Changes to Terms">
          <p>
            Hum in terms ko update kar sakte hain. Important changes ki notification email se di jayegi.
            Updated terms ka continued use aapki acceptance maan li jayegi.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Terms se related koi sawaal ho to:{' '}
            <a href="mailto:support@stunivoz.com" className="text-primary-500 hover:underline font-medium">
              support@stunivoz.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
};
