import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase, Calendar, BookOpen, FileText, TrendingUp, Target,
  Sparkles, ArrowRight, Clock, CheckCircle, Star, Users, Award, Zap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent, Button, ProgressBar } from '../../components/common';

export const DashboardPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const stats = [
    { label: 'Applications', value: 12, icon: FileText, color: 'text-primary-500', bg: 'bg-primary-100', to: '/internships' },
    { label: 'Interviews', value: 3, icon: Calendar, color: 'text-accent-500', bg: 'bg-accent-100', to: '/planner' },
    { label: 'Saved', value: 8, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100', to: '/internships' },
    { label: 'Points', value: 1250, icon: Zap, color: 'text-orange-500', bg: 'bg-orange-100', to: '/gamification' },
  ];

  const recommendedInternships = [
    { id: '1', company: 'Google', role: 'Frontend Developer Intern', location: 'Bangalore', stipend: '₹50,000/month', skills: ['React', 'TypeScript', 'CSS'], posted: '2 days ago' },
    { id: '2', company: 'Microsoft', role: 'Full Stack Developer', location: 'Hyderabad', stipend: '₹45,000/month', skills: ['Node.js', 'React', 'SQL'], posted: '3 days ago' },
    { id: '3', company: 'Amazon', role: 'SDE Intern', location: 'Bangalore', stipend: '₹40,000/month', skills: ['Python', 'AWS', 'Data Structures'], posted: '5 days ago' },
  ];

  const upcomingEvents = [
    { id: '1', title: 'Google Cloud Hackathon', date: 'May 15, 2026', type: 'Hackathon' },
    { id: '2', title: 'AWS Career Workshop', date: 'May 18, 2026', type: 'Webinar' },
  ];

  const recommendedCourses = [
    { id: '1', title: 'Complete Web Development Bootcamp', platform: 'Udemy', rating: 4.8, duration: '48 hours' },
    { id: '2', title: 'React - The Complete Guide', platform: 'Udemy', rating: 4.7, duration: '52 hours' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}! 👋
            </h1>
            <p className="text-primary-100 text-lg">
              Ready to boost your career? Let's check your progress and find new opportunities.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="bg-white text-primary-600 hover:bg-primary-50"
              onClick={() => navigate('/career')}
            >
              <Sparkles className="w-5 h-5" />
              AI Career Guide
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Link key={index} to={stat.to}>
            <Card className="!p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recommended Internships */}
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardHeader
                    title="Recommended Internships"
                    subtitle="Based on your profile and skills"
                  />
                </div>
                <Link to="/internships">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendedInternships.map((internship) => (
                <div key={internship.id} className="p-4 lg:p-6 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{internship.role}</h3>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Active</span>
                    </div>
                    <p className="text-gray-600">{internship.company}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{internship.location}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="w-4 h-4" />{internship.stipend}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{internship.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {internship.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{skill}</span>
                      ))}
                    </div>
                    <Button variant="primary" size="sm" onClick={() => navigate('/internships')}>
                      Apply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resume Score */}
          <Card>
            <CardHeader title="Resume Score" subtitle="Last checked: Today" />
            <CardContent>
              <div className="flex items-center justify-center mb-4">
                <div className="relative w-32 h-32">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                    <circle cx="64" cy="64" r="56" stroke="#0ea5e9" strokeWidth="8" fill="none"
                      strokeDasharray="351.86" strokeDashoffset="87.96" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">75</div>
                      <div className="text-xs text-gray-500">/ 100</div>
                    </div>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/resume')}>
                Improve Resume <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardHeader title="Upcoming Events" />
                <Link to="/events">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/events')}>
                  <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-accent-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.title}</div>
                    <div className="text-xs text-gray-500">{event.date}</div>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">{event.type}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommended Courses */}
          <Card padding="none">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardHeader title="Recommended Courses" />
                <Link to="/courses">
                  <Button variant="ghost" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recommendedCourses.map((course) => (
                <div key={course.id} className="p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer" onClick={() => navigate('/courses')}>
                  <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{course.title}</div>
                    <div className="text-xs text-gray-500">{course.platform} · {course.duration}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />{course.rating}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Career Path Progress */}
      <Card>
        <CardHeader
          title="Your Career Path"
          subtitle="Web Development"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate('/career')}>
              View Roadmap <ArrowRight className="w-4 h-4" />
            </Button>
          }
        />
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">5</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">3</div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-400">8</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">42%</div>
              <div className="text-sm text-gray-500">Progress</div>
            </div>
          </div>
          <ProgressBar value={42} color="primary" />
        </CardContent>
      </Card>

      {/* Badges & Achievements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader
            title="Recent Badges"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/gamification')}>View All</Button>}
          />
          <CardContent>
            <div className="flex gap-4">
              {[
                { icon: Award, label: 'First Apply', bg: 'bg-yellow-50', color: 'text-yellow-500' },
                { icon: CheckCircle, label: 'Profile', bg: 'bg-green-50', color: 'text-green-500' },
                { icon: Users, label: 'Community', bg: 'bg-primary-50', color: 'text-primary-500' },
                { icon: Target, label: 'Locked', bg: 'bg-gray-100', color: 'text-gray-400', locked: true },
              ].map((badge, i) => (
                <div
                  key={i}
                  onClick={() => !badge.locked && navigate('/gamification')}
                  className={`flex flex-col items-center gap-2 p-4 ${badge.bg} rounded-xl cursor-pointer hover:scale-105 transition-transform ${badge.locked ? 'opacity-50 cursor-default' : ''}`}
                >
                  <badge.icon className={`w-8 h-8 ${badge.color}`} />
                  <span className="text-xs font-medium">{badge.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Leaderboard"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/gamification')}>View All</Button>}
          />
          <CardContent>
            <div className="space-y-3">
              {[
                { rank: '1', name: 'Alex Johnson', pts: '2,450', rankBg: 'bg-yellow-400', avatarBg: 'bg-primary-100', avatarColor: 'text-primary-600', letter: 'A', ptsColor: 'text-primary-600' },
                { rank: '2', name: 'Sarah Chen', pts: '2,120', rankBg: 'bg-gray-400', avatarBg: 'bg-accent-100', avatarColor: 'text-accent-600', letter: 'S', ptsColor: 'text-accent-600' },
                { rank: '3', name: 'Mike Smith', pts: '1,980', rankBg: 'bg-orange-400', avatarBg: 'bg-green-100', avatarColor: 'text-green-600', letter: 'M', ptsColor: 'text-green-600' },
              ].map((entry) => (
                <div key={entry.rank} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full ${entry.rankBg} text-white text-sm flex items-center justify-center font-bold`}>{entry.rank}</span>
                  <div className={`w-8 h-8 rounded-full ${entry.avatarBg} flex items-center justify-center ${entry.avatarColor} font-semibold`}>{entry.letter}</div>
                  <span className="flex-1 font-medium text-gray-800">{entry.name}</span>
                  <span className={`font-semibold ${entry.ptsColor}`}>{entry.pts} pts</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
