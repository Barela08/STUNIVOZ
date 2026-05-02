import React, { useState } from 'react';
import { Card, CardContent, Button } from '../../components/common';
import { Star, Building, BookOpen } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'internships' | 'courses'>('internships');

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Reviews & Ratings</h1>
          <p className="text-gray-500">Read what other students are saying</p>
        </div>
        <Button variant="primary">Write a Review</Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
            activeTab === 'internships'
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
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
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
          onClick={() => setActiveTab('courses')}
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Course Reviews
          </div>
        </button>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-600">
                    A
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Anonymous Student</h3>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'internships' ? 'Frontend Intern at TechCorp' : 'Complete Web Dev Bootcamp'}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4 fill-current" />
                      <Star className="w-4 h-4" />
                    </div>
                  </div>
                </div>
                <span className="text-sm text-gray-400">2 weeks ago</span>
              </div>
              <p className="mt-4 text-gray-700">
                {activeTab === 'internships' 
                  ? "Great learning experience! The mentors were very helpful and I got to work on real production features. The stipend was paid on time, but the workload can be heavy during release weeks."
                  : "This course is amazing for beginners. It covers everything from HTML to advanced React concepts. The instructor explains things very clearly, but some sections are a bit outdated."}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
