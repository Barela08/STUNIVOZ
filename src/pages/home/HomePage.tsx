import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, BookOpen, Target, Sparkles, ShieldCheck } from 'lucide-react';
import { Button } from '../../components/common';
import { PublicNavbar } from '../../components/Layout/PublicNavbar';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white z-0" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-primary-200/50 rounded-full blur-3xl" />
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-96 h-96 bg-accent-200/50 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-medium text-sm mb-8 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>The #1 All-in-One Student Career Platform</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-8 leading-tight animate-slide-up">
              Launch Your Career With <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-500">Confidence</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
              Build your AI-powered resume, find top internships, master new skills, and connect with a community of ambitious students.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup">
                <Button variant="primary" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl shadow-lg shadow-primary-500/30">
                  Get Started For Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/internships">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4 rounded-xl">
                  Explore Internships
                </Button>
              </Link>
            </div>
            
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span>100% Free for Students</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-500" />
                <span>AI-Powered Matching</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-4">Everything you need to succeed</h2>
            <p className="text-lg text-gray-600">Powerful tools designed specifically for college students.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center mb-6">
                <Briefcase className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Internships</h3>
              <p className="text-gray-600 mb-4">Access verified internship opportunities from top companies. Filter by stipend, role, and location.</p>
              <Link to="/internships" className="text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                Browse listings <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-accent-100 text-accent-600 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Skill Building Courses</h3>
              <p className="text-gray-600 mb-4">Curated free and paid courses to help you master the skills companies are actually looking for.</p>
              <Link to="/courses" className="text-accent-600 font-medium hover:text-accent-700 flex items-center gap-1">
                Explore courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Resume Builder</h3>
              <p className="text-gray-600 mb-4">Create ATS-friendly resumes in minutes. Get an instant ATS score and keyword improvement suggestions.</p>
              <Link to="/signup" className="text-green-600 font-medium hover:text-green-700 flex items-center gap-1">
                Build your resume <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
              <div className="w-64 h-64 bg-white/10 rounded-full blur-2xl" />
            </div>
            
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 relative z-10">Ready to kickstart your career?</h2>
            <p className="text-primary-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of students who are already using STUNIVOZ to land their dream internships and jobs.
            </p>
            <Link to="/signup" className="relative z-10">
              <Button variant="secondary" size="lg" className="text-lg px-8 py-4 rounded-xl text-primary-700">
                Create Your Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex flex-col items-center md:items-start gap-2">
              <div className="bg-white rounded-xl px-3 py-2 shadow-md">
                <img src="/stunivoz-brand-logo.png" alt="STUNIVOZ" className="h-10 w-auto object-contain" />
              </div>
              <p className="text-xs text-gray-500">
                Created by{' '}
                <span className="text-gray-300 font-semibold">Nilesh Barela</span>
                {' '}· Founder,{' '}
                <a
                  href="https://hackifypro.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  HackifyPro
                </a>
                {' '}– a cybersecurity learning platform
              </p>
            </div>
            <div className="flex gap-6">
              <Link to="/internships" className="hover:text-white transition-colors">Internships</Link>
              <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
              <Link to="/events" className="hover:text-white transition-colors">Events</Link>
            </div>
            <p className="text-sm text-center">© 2026 STUNIVOZ. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
