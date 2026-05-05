import React from 'react';
import { Shield } from 'lucide-react';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{title}</h2>
    <div className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed space-y-2">{children}</div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex w-16 h-16 rounded-2xl bg-green-100 dark:bg-green-900/30 items-center justify-center mb-4">
          <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Last updated: May 2026</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 space-y-8">
        <Section title="1. Humara Parichay">
          <p>
            STUNIVOZ (<strong>HackifyPro</strong> dwara banaya gaya) ek student career development platform hai.
            Yeh privacy policy batati hai ki hum aapki kaunsi jaankari collect karte hain, use kaise karte hain, aur kaise surakshit rakhte hain.
          </p>
        </Section>

        <Section title="2. Hum Kya Jaankari Collect Karte Hain">
          <ul className="list-disc list-inside space-y-1">
            <li>Account information: naam, email, college, course, graduation year</li>
            <li>Profile details: skills, experience, resume data</li>
            <li>Usage data: pages visited, features used, search queries</li>
            <li>Uploaded files: resume PDFs, profile photos (Cloudinary par store hote hain)</li>
            <li>Device information: browser type, IP address</li>
          </ul>
        </Section>

        <Section title="3. Jaankari Ka Upyog">
          <ul className="list-disc list-inside space-y-1">
            <li>Aapko relevant internships aur courses recommend karne ke liye</li>
            <li>Resume builder aur ATS analyzer features provide karne ke liye</li>
            <li>Platform improve karne ke liye</li>
            <li>Important updates ya emails bhejne ke liye</li>
            <li>Security aur fraud prevention ke liye</li>
          </ul>
        </Section>

        <Section title="4. Jaankari Ki Sharing">
          <p>
            Hum aapki personal jaankari kisi third party ko sell nahi karte.
            Hum sirf in cases mein share karte hain:
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Jab aap kisi internship ke liye apply karte hain (company ko sirf relevant details)</li>
            <li>Legal requirements hone par</li>
            <li>Firebase, Cloudinary jaise trusted service providers ke saath (jo data process karte hain)</li>
          </ul>
        </Section>

        <Section title="5. Data Suraksha">
          <p>
            Hum Firebase Authentication aur Firestore use karte hain jo industry-standard encryption provide karta hai.
            Aapki files Cloudinary ke secure servers par store hoti hain.
            Hamare Firestore security rules ensure karte hain ki koi dusra user aapka data access na kar sake.
          </p>
        </Section>

        <Section title="6. Aapke Adhikar">
          <ul className="list-disc list-inside space-y-1">
            <li>Apna data dekhne ka adhikar (Settings &gt; Profile)</li>
            <li>Apna data edit/delete karne ka adhikar</li>
            <li>Account delete karne ka adhikar (Settings section se)</li>
            <li>Kisi bhi email se unsubscribe karne ka adhikar</li>
          </ul>
        </Section>

        <Section title="7. Cookies">
          <p>
            Hum authentication ke liye session cookies use karte hain.
            Ye cookies login session maintain karne ke liye zaroori hain.
            Aap browser settings se cookies control kar sakte hain, lekin isse login functionality affect ho sakti hai.
          </p>
        </Section>

        <Section title="8. Contact">
          <p>
            Privacy se related koi sawaal ho to humse contact karein:{' '}
            <a href="mailto:support@stunivoz.com" className="text-primary-500 hover:underline font-medium">
              support@stunivoz.com
            </a>
          </p>
        </Section>
      </div>
    </div>
  );
};
