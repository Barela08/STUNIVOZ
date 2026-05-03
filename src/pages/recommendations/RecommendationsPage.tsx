import React, { useState } from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { Sparkles, X, MapPin, Clock, DollarSign, BookOpen, ExternalLink, CheckCircle } from 'lucide-react';

type Internship = {
  id: string;
  role: string;
  company: string;
  location: string;
  duration: string;
  stipend: string;
  skills: string[];
  match: number;
  description: string;
  responsibilities: string[];
};

type Course = {
  id: string;
  title: string;
  platform: string;
  rating: string;
  duration: string;
  gap: string;
  url: string;
  description: string;
  topics: string[];
};

const internships: Internship[] = [
  {
    id: '1',
    role: 'Software Engineer Intern',
    company: 'TechCorp Inc.',
    location: 'Remote',
    duration: '3 months',
    stipend: '₹40,000/month',
    skills: ['React', 'Node.js'],
    match: 92,
    description: 'Join our product engineering team to build and ship features for 10M+ users. You\'ll work closely with senior engineers on React frontend and Node.js backend.',
    responsibilities: ['Build React components', 'Write REST APIs in Node.js', 'Code review participation', 'Deploy via CI/CD pipeline'],
  },
  {
    id: '2',
    role: 'Frontend Developer Intern',
    company: 'StartupXYZ',
    location: 'Bangalore',
    duration: '6 months',
    stipend: '₹25,000/month',
    skills: ['React', 'TypeScript'],
    match: 87,
    description: 'We\'re a Series A startup building the next generation of SaaS tools. You\'ll own complete frontend features from design to deployment.',
    responsibilities: ['Design and implement UI components', 'Collaborate with product team', 'Performance optimisation', 'Write unit tests'],
  },
  {
    id: '3',
    role: 'Full Stack Intern',
    company: 'FinTech Solutions',
    location: 'Hyderabad',
    duration: '4 months',
    stipend: '₹35,000/month',
    skills: ['MERN', 'AWS'],
    match: 80,
    description: 'FinTech Solutions processes ₹500Cr+ in transactions daily. Intern with our platform team and work on real high-scale systems.',
    responsibilities: ['Build payment microservices', 'Write and optimize MongoDB queries', 'Integrate third-party APIs', 'Security and compliance implementation'],
  },
];

const courses: Course[] = [
  {
    id: '1',
    title: 'Advanced React Patterns',
    platform: 'Udemy',
    rating: '4.8',
    duration: '18 hours',
    gap: 'Frontend',
    url: 'https://udemy.com',
    description: 'Master advanced React patterns including HOCs, render props, compound components, and performance optimization techniques.',
    topics: ['HOCs & Render Props', 'Compound Components', 'Custom Hooks', 'Context Optimization', 'React Query', 'Performance Profiling'],
  },
  {
    id: '2',
    title: 'Node.js: The Complete Guide',
    platform: 'Coursera',
    rating: '4.7',
    duration: '40 hours',
    gap: 'Backend',
    url: 'https://coursera.org',
    description: 'From zero to production-ready Node.js apps. Covers REST APIs, GraphQL, authentication, testing, and deployment.',
    topics: ['REST & GraphQL APIs', 'JWT Authentication', 'MongoDB with Mongoose', 'Testing with Jest', 'Docker Deployment', 'Performance Tuning'],
  },
  {
    id: '3',
    title: 'TypeScript Masterclass',
    platform: 'Frontend Masters',
    rating: '4.9',
    duration: '12 hours',
    gap: 'TypeScript',
    url: 'https://frontendmasters.com',
    description: 'Deep-dive TypeScript course for JavaScript developers. Covers generics, utility types, type inference, and real-world patterns.',
    topics: ['Type System Basics', 'Generics & Utility Types', 'Type Guards', 'Mapped Types', 'TypeScript with React', 'Configuration & Build'],
  },
];

const nextSteps = [
  {
    id: '1',
    title: 'Master TypeScript',
    description: '90% of saved jobs require TypeScript. Learning this will boost your ATS score significantly.',
    type: 'skill',
    urgency: 'high',
    action: 'Start Learning',
  },
  {
    id: '2',
    title: 'Update GitHub Portfolio',
    description: 'Your GitHub link returns 404. Fixing it will add 15+ points to your profile score.',
    type: 'profile',
    urgency: 'medium',
    action: 'Fix Now',
  },
  {
    id: '3',
    title: 'Add 2 More Projects',
    description: 'Candidates with 4+ projects get 2x more interview calls. Add your side projects now.',
    type: 'project',
    urgency: 'medium',
    action: 'Go to Resume',
  },
  {
    id: '4',
    title: 'Complete Career Roadmap',
    description: 'You\'re 25% through the Web Development roadmap. Completing it unlocks premium job matches.',
    type: 'learning',
    urgency: 'low',
    action: 'View Roadmap',
  },
];

export const RecommendationsPage: React.FC = () => {
  const [detailInternship, setDetailInternship] = useState<Internship | null>(null);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleApply = (id: string, role: string) => {
    setApplied(prev => new Set([...prev, id]));
    setDetailInternship(null);
    showToast(`Applied to "${role}" successfully!`);
  };

  const handleEnroll = (id: string, title: string) => {
    setEnrolled(prev => new Set([...prev, id]));
    setDetailCourse(null);
    showToast(`Enrolled in "${title}"!`);
  };

  const urgencyStyle = (urgency: string) => {
    if (urgency === 'high') return 'bg-red-50 border-red-100';
    if (urgency === 'medium') return 'bg-yellow-50 border-yellow-100';
    return 'bg-blue-50 border-blue-100';
  };

  const urgencyBtnStyle = (urgency: string) => {
    if (urgency === 'high') return 'bg-red-500 hover:bg-red-600 text-white';
    if (urgency === 'medium') return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    return 'bg-blue-500 hover:bg-blue-600 text-white';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg bg-green-600 text-white text-sm font-medium">
          <CheckCircle className="w-4 h-4" /> {toast}
        </div>
      )}

      {/* Internship Detail Modal */}
      {detailInternship && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{detailInternship.role}</h3>
                <p className="text-sm text-gray-500">{detailInternship.company}</p>
              </div>
              <button onClick={() => setDetailInternship(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <MapPin className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm font-semibold text-gray-800">{detailInternship.location}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <Clock className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="text-sm font-semibold text-gray-800">{detailInternship.duration}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <DollarSign className="w-4 h-4 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">Stipend</p>
                  <p className="text-sm font-semibold text-gray-800">{detailInternship.stipend}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Match Score</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-100 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${detailInternship.match}%` }} />
                  </div>
                  <span className="text-sm font-bold text-green-600">{detailInternship.match}%</span>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">About</p>
                <p className="text-sm text-gray-600 leading-relaxed">{detailInternship.description}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Responsibilities</p>
                <ul className="space-y-1.5">
                  {detailInternship.responsibilities.map((r, i) => (
                    <li key={i} className="text-sm text-gray-600 flex gap-2">
                      <span className="text-primary-500 shrink-0">→</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills Required</p>
                <div className="flex gap-2 flex-wrap">
                  {detailInternship.skills.map(s => (
                    <span key={s} className="px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDetailInternship(null)}>Close</Button>
              {applied.has(detailInternship.id) ? (
                <Button variant="primary" className="flex-1 bg-green-500 hover:bg-green-600" disabled>
                  <CheckCircle className="w-4 h-4" /> Applied
                </Button>
              ) : (
                <Button variant="primary" className="flex-1" onClick={() => handleApply(detailInternship.id, detailInternship.role)}>
                  Apply Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Course Detail Modal */}
      {detailCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <h3 className="font-bold text-gray-900">{detailCourse.title}</h3>
                <p className="text-sm text-gray-500">{detailCourse.platform} · ⭐ {detailCourse.rating} · {detailCourse.duration}</p>
              </div>
              <button onClick={() => setDetailCourse(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="inline-flex items-center gap-1 px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-xs font-semibold">
                <BookOpen className="w-3 h-3" /> Fills your {detailCourse.gap} skill gap
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{detailCourse.description}</p>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">What You'll Learn</p>
                <div className="grid grid-cols-2 gap-2">
                  {detailCourse.topics.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-5 border-t border-gray-100 flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setDetailCourse(null)}>Close</Button>
              {enrolled.has(detailCourse.id) ? (
                <Button variant="primary" className="flex-1 bg-green-500 hover:bg-green-600" disabled>
                  <CheckCircle className="w-4 h-4" /> Enrolled
                </Button>
              ) : (
                <Button variant="primary" className="flex-1" onClick={() => handleEnroll(detailCourse.id, detailCourse.title)}>
                  <ExternalLink className="w-4 h-4" /> Enroll Now
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">AI Recommendations</h1>
            <p className="text-accent-100 mt-1">Personalized opportunities curated just for you</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-2">
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
            {internships.length} matching internships
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
            {courses.length} recommended courses
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-2 text-sm font-medium">
            {nextSteps.length} action items
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Internships */}
        <Card>
          <CardHeader title="Internships For You" subtitle="Based on your skills & profile" />
          <CardContent className="space-y-4">
            {internships.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900 text-sm">{item.role}</h4>
                  <span className="text-xs font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full shrink-0 ml-2">{item.match}% match</span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{item.company} · {item.location}</p>
                <p className="text-xs text-gray-400 mb-2">{item.stipend} · {item.duration}</p>
                <div className="flex gap-1.5 mb-3 flex-wrap">
                  {item.skills.map(s => (
                    <span key={s} className="text-xs px-2 py-0.5 bg-white rounded-md border border-gray-200 text-gray-600">{s}</span>
                  ))}
                </div>
                {applied.has(item.id) ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Applied
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full" onClick={() => setDetailInternship(item)}>
                    View Details
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Courses */}
        <Card>
          <CardHeader title="Recommended Courses" subtitle="Fill your skill gaps" />
          <CardContent className="space-y-4">
            {courses.map((item) => (
              <div key={item.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-accent-200 transition-colors">
                <h4 className="font-bold text-gray-900 text-sm mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500 mb-1">{item.platform} · ⭐ {item.rating}</p>
                <p className="text-xs text-green-600 font-medium mb-1">{item.duration}</p>
                <p className="text-xs text-accent-600 font-medium mb-3">Fills your {item.gap} skill gap</p>
                {enrolled.has(item.id) ? (
                  <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                    <CheckCircle className="w-4 h-4" /> Enrolled
                  </div>
                ) : (
                  <Button variant="outline" size="sm" className="w-full text-accent-600 border-accent-200 hover:bg-accent-50" onClick={() => setDetailCourse(item)}>
                    View & Enroll
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card>
          <CardHeader title="Career Next Steps" subtitle="Actions to boost your profile" />
          <CardContent className="space-y-3">
            {nextSteps.map((step) => (
              <div key={step.id} className={`p-4 rounded-xl border ${urgencyStyle(step.urgency)}`}>
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-bold text-gray-900 text-sm">{step.title}</h4>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ml-2 shrink-0 ${
                    step.urgency === 'high' ? 'bg-red-100 text-red-600' :
                    step.urgency === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>{step.urgency}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                <button
                  className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-colors ${urgencyBtnStyle(step.urgency)}`}
                  onClick={() => showToast(`Opening: ${step.action}`)}
                >
                  {step.action}
                </button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
