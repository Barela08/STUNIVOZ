import React from 'react';
import { Card, CardHeader, CardContent, Button } from '../../components/common';
import { Award, Zap, Target, Star, Lock } from 'lucide-react';

export const GamificationPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-20">
          <Award className="w-64 h-64" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-white/30">
              <span className="text-4xl font-bold">12</span>
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold mb-1">Level 12 Explorer</h1>
              <p className="text-yellow-100 flex items-center gap-2">
                <Zap className="w-4 h-4 fill-current" /> 1,250 Total Points
              </p>
            </div>
          </div>
          <div className="w-full md:w-64 bg-black/20 rounded-xl p-4 backdrop-blur-sm">
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>Progress to Lvl 13</span>
              <span>250 pts left</span>
            </div>
            <div className="h-2 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full w-3/4" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Badges */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader title="Your Badges" subtitle="Complete challenges to unlock" />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {/* Unlocked Badges */}
                <div className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 text-center">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-500 rounded-full flex items-center justify-center mb-2">
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">First Steps</span>
                  <span className="text-xs text-gray-500 mt-1">Complete profile</span>
                </div>
                
                <div className="flex flex-col items-center p-4 bg-primary-50 rounded-xl border border-primary-200 text-center">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mb-2">
                    <Target className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Go Getter</span>
                  <span className="text-xs text-gray-500 mt-1">5 applications</span>
                </div>

                {/* Locked Badges */}
                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                  <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-2 relative">
                    <Lock className="w-4 h-4 absolute top-0 right-0 text-gray-700 bg-white rounded-full" />
                    <Award className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Top 1%</span>
                  <span className="text-xs text-gray-500 mt-1">Reach 5,000 pts</span>
                </div>

                <div className="flex flex-col items-center p-4 bg-gray-50 rounded-xl border border-gray-200 text-center opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-not-allowed">
                  <div className="w-12 h-12 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center mb-2 relative">
                    <Lock className="w-4 h-4 absolute top-0 right-0 text-gray-700 bg-white rounded-full" />
                    <Zap className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">Streak Master</span>
                  <span className="text-xs text-gray-500 mt-1">30 day streak</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Global Leaderboard */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader title="Leaderboard" subtitle="Top students this week" />
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Alex Johnson', pts: '2,450', color: 'bg-yellow-400', rank: 1 },
                  { name: 'Sarah Chen', pts: '2,120', color: 'bg-gray-300', rank: 2 },
                  { name: 'Mike Smith', pts: '1,980', color: 'bg-orange-400', rank: 3 },
                  { name: 'Priya Patel', pts: '1,850', color: 'bg-gray-100', rank: 4 },
                  { name: 'You', pts: '1,250', color: 'bg-primary-100 text-primary-600 border border-primary-200', rank: 12 },
                ].map((user, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${user.name === 'You' ? user.color : ''}`}>
                    <span className={`w-6 h-6 rounded-full text-white text-xs flex items-center justify-center font-bold ${user.name === 'You' ? 'bg-primary-500' : user.color}`}>
                      {user.rank}
                    </span>
                    <span className={`flex-1 font-medium ${user.name === 'You' ? 'text-primary-700' : 'text-gray-900'}`}>{user.name}</span>
                    <span className={`font-bold ${user.name === 'You' ? 'text-primary-600' : 'text-gray-500'}`}>{user.pts}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
