import React, { useState } from 'react';
import { Card, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { Star, Building, BookOpen } from 'lucide-react';
import { useCollection } from '../../hooks/useCollection';
import type { Review } from '../../types';

export const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'internship' | 'course'>('internship');
  const reviews = useCollection<Review>('reviews');
  const visibleReviews = reviews.data.filter((review) => review.review_type === activeTab || (activeTab === 'internship' && review.review_type === 'company'));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-500">Real reviews from student submissions.</p>
        </div>
        <Button variant="primary">Write a Review</Button>
      </div>

      <div className="flex border-b border-gray-200">
        <button className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'internship' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('internship')}>
          <div className="flex items-center gap-2"><Building className="w-4 h-4" /> Company Reviews</div>
        </button>
        <button className={`px-6 py-3 font-medium text-sm border-b-2 ${activeTab === 'course' ? 'border-primary-500 text-primary-600' : 'border-transparent text-gray-500'}`} onClick={() => setActiveTab('course')}>
          <div className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Course Reviews</div>
        </button>
      </div>

      {reviews.loading ? (
        <Loading text="Loading reviews..." />
      ) : visibleReviews.length === 0 ? (
        <Card><EmptyState title="No reviews yet" description="Student reviews will appear here after they are submitted." /></Card>
      ) : (
        <div className="space-y-4">
          {visibleReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-gray-900">Student Review</h3>
                    <p className="text-sm text-gray-500">{review.review_type} - {review.item_id}</p>
                    <div className="flex items-center gap-1 mt-1 text-yellow-400">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className={`w-4 h-4 ${index < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-gray-400">{review.created_at ? new Date(review.created_at).toLocaleDateString() : ''}</span>
                </div>
                <p className="mt-4 text-gray-700">{review.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
