import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '../../components/common';
import { Star, Building, BookOpen, MessageSquare, Loader2 } from 'lucide-react';
import { db } from '../../services/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface Review {
  id: string;
  authorName: string;
  authorInitial: string;
  type: 'internship' | 'course';
  target: string;
  rating: number;
  body: string;
  createdAt: any;
}

export const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'internships' | 'courses'>('internships');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'reviews'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setReviews(snap.docs.map(d => ({ id: d.id, ...d.data() } as Review)));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsub();
  }, []);

  const filtered = reviews.filter(r =>
    activeTab === 'internships' ? r.type === 'internship' : r.type === 'course'
  );

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5 mt-1">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        />
      ))}
    </div>
  );

  const formatDate = (ts: any) => {
    if (!ts) return '';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch { return ''; }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Reviews & Ratings</h1>
          <p className="text-gray-500 dark:text-gray-400">Read what other students are saying</p>
        </div>
        {user && (
          <Button variant="primary">Write a Review</Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'internships'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setActiveTab('internships')}
        >
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" />
            Company Reviews
          </div>
        </button>
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'courses'
              ? 'border-primary-500 text-primary-600 dark:text-primary-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Reviews
          </div>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No reviews yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm">
            Be the first to share your experience with a {activeTab === 'internships' ? 'company' : 'course'}.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(review => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 flex-shrink-0 text-lg">
                      {review.authorInitial || (review.authorName?.charAt(0)?.toUpperCase() ?? '?')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white">{review.authorName || 'Student'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{review.target}</p>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">{formatDate(review.createdAt)}</span>
                </div>
                {review.body && (
                  <p className="mt-4 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{review.body}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
