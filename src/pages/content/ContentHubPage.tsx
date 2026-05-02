import React, { useState } from 'react';
import { Card, CardContent } from '../../components/common';
import { PlayCircle, FileText, Lightbulb, Search } from 'lucide-react';

export const ContentHubPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  const filters = [
    { id: 'all', label: 'All Content' },
    { id: 'blogs', label: 'Career Blogs' },
    { id: 'videos', label: 'Tutorial Videos' },
    { id: 'tips', label: 'Interview Tips' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Content Hub</h1>
          <p className="text-gray-500">Learn, prepare, and grow your career</p>
        </div>
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search articles, videos..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full md:w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {filters.map(filter => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              activeFilter === filter.id 
                ? 'bg-primary-500 text-white shadow-md' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Blog Post */}
        <Card className="overflow-hidden cursor-pointer group">
          <div className="h-48 bg-gray-200 relative overflow-hidden">
            <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&q=80" alt="Coding" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-primary-600 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Blog
            </div>
          </div>
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">How to Ace Your Technical Interview in 2026</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">A comprehensive guide on preparing for algorithms, system design, and behavioral questions at top tech companies.</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By TechTeam</span>
              <span>5 min read</span>
            </div>
          </CardContent>
        </Card>

        {/* Video */}
        <Card className="overflow-hidden cursor-pointer group">
          <div className="h-48 bg-gray-800 relative flex items-center justify-center group-hover:bg-gray-900 transition-colors">
            <PlayCircle className="w-16 h-16 text-white/80 group-hover:text-white group-hover:scale-110 transition-all" />
            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-accent-600 flex items-center gap-1">
              <PlayCircle className="w-3 h-3" /> Video
            </div>
          </div>
          <CardContent className="p-5">
            <h3 className="font-bold text-gray-900 mb-2 group-hover:text-accent-600 transition-colors">React Hooks Masterclass</h3>
            <p className="text-sm text-gray-600 mb-4 line-clamp-2">Learn useState, useEffect, and custom hooks in this fast-paced crash course.</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By CodeGuru</span>
              <span>12 mins</span>
            </div>
          </CardContent>
        </Card>

        {/* Tip */}
        <Card className="overflow-hidden cursor-pointer group bg-yellow-50 border-yellow-100">
          <CardContent className="p-6 h-full flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Resume Tip of the Day</h3>
              <p className="text-sm text-gray-700 italic mb-4">"Always tailor your resume for the specific job description. Use the exact keywords they use in the requirements section to pass the ATS filter."</p>
            </div>
            <div className="text-xs font-medium text-yellow-600 uppercase tracking-wider">
              Career Tips
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
