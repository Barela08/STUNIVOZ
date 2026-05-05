import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { Sparkles, Briefcase, BookOpen, ArrowRight, Map, Target, Star } from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
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
      </div>

      {/* Coming Soon Notice */}
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          AI Recommendations Coming Soon
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mb-8">
          We're building a smart recommendation engine that will suggest internships, courses, and career actions
          tailored to your profile, skills, and goals. Stay tuned!
        </p>

        <div className="grid sm:grid-cols-3 gap-4 w-full max-w-2xl">
          <Card hover className="cursor-pointer">
            <CardContent className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Browse Internships</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Find real internship listings posted by companies</p>
              <Link to="/internships">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer">
            <CardContent className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Explore Courses</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Discover courses to upskill and grow your career</p>
              <Link to="/courses">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card hover className="cursor-pointer">
            <CardContent className="flex flex-col items-center text-center py-6">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-3">
                <Map className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1 text-sm">Career Roadmaps</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Follow structured roadmaps to reach your goals</p>
              <Link to="/roadmaps">
                <Button variant="outline" size="sm">
                  View All <ArrowRight className="w-3 h-3" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-4 w-full max-w-2xl">
          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">Check ATS Score</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Analyze and optimize your resume</p>
              </div>
              <Link to="/ats"><Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button></Link>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">AI Career Advisor</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Get personalized career guidance</p>
              </div>
              <Link to="/career"><Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
