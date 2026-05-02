import React from 'react';
import { Card, CardHeader, CardContent, EmptyState, Loading } from '../../components/common';
import { Award, Zap, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Badge, UserBadge, UserPoints } from '../../types';

export const GamificationPage: React.FC = () => {
  const { user } = useAuth();
  const badges = useCollection<Badge>('badges');
  const userBadges = useCollection<UserBadge>('user_badges');
  const userPoints = useCollection<UserPoints>('user_points');
  const points = userPoints.data.find((item) => item.user_id === user?.uid)?.points || 0;
  const earnedBadgeIds = userBadges.data.filter((item) => item.user_id === user?.uid).map((item) => item.badge_id);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-6 lg:p-8 text-white">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-4 border-white/30">
            <Award className="w-10 h-10" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Achievements</h1>
            <p className="text-yellow-100 flex items-center gap-2"><Zap className="w-4 h-4 fill-current" /> {points} total points</p>
          </div>
        </div>
      </div>

      {badges.loading || userBadges.loading || userPoints.loading ? (
        <Loading text="Loading achievements..." />
      ) : badges.data.length === 0 ? (
        <Card><EmptyState icon={<Award className="w-6 h-6" />} title="No badges configured" description="Add badge records to Firestore to enable achievements." /></Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader title="Badges" subtitle="Earned badges are based on real user_badges records." />
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {badges.data.map((badge) => {
                  const earned = earnedBadgeIds.includes(badge.id);
                  return (
                    <div key={badge.id} className={`flex flex-col items-center p-4 rounded-lg border text-center ${earned ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200 opacity-70'}`}>
                      <div className="w-12 h-12 bg-white text-yellow-500 rounded-full flex items-center justify-center mb-2 relative">
                        {!earned && <Lock className="w-4 h-4 absolute -top-1 -right-1 text-gray-500 bg-white rounded-full" />}
                        <Award className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">{badge.name}</span>
                      <span className="text-xs text-gray-500 mt-1">{badge.description}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Leaderboard" />
            <CardContent>
              <EmptyState title="No leaderboard yet" description="Leaderboard will populate from real user_points records." />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
