import React from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { Sparkles, Briefcase, BookOpen, Target } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
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
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader title="Internships for You" />
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                <h4 className="font-bold text-gray-900">Software Engineer Intern</h4>
                <p className="text-sm text-gray-500 mb-2">TechCorp Inc. • Remote</p>
                <div className="flex gap-2 mb-3">
                  <span className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200">React</span>
                  <span className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200">Node.js</span>
                </div>
                <Button variant="outline" size="sm" className="w-full">View Details</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Recommended Courses" />
          <CardContent className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-accent-200 transition-colors">
                <h4 className="font-bold text-gray-900">Advanced React Patterns</h4>
                <p className="text-sm text-gray-500 mb-2">Udemy • 4.8 Rating</p>
                <p className="text-xs text-green-600 font-medium mb-3">Matches your skill gap in Frontend</p>
                <Button variant="outline" size="sm" className="w-full text-accent-600 border-accent-200 hover:bg-accent-50">Enroll Now</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Career Path Next Steps" />
          <CardContent className="space-y-4">
            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
              <h4 className="font-bold text-gray-900">Master TypeScript</h4>
              <p className="text-sm text-gray-600 mt-1 mb-3">90% of jobs you saved require TypeScript. Learning this will boost your profile.</p>
              <Button variant="primary" size="sm" className="w-full bg-green-500 hover:bg-green-600">Start Learning</Button>
            </div>
            <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
              <h4 className="font-bold text-gray-900">Update Portfolio</h4>
              <p className="text-sm text-gray-600 mt-1 mb-3">Your GitHub link is broken. Fix it to improve your ATS score.</p>
              <Button variant="outline" size="sm" className="w-full border-yellow-300 text-yellow-700 hover:bg-yellow-100">Fix Now</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
