import React, { useState } from 'react';
import { Search, Clock, Star, Users, ExternalLink, Play, Heart } from 'lucide-react';
import { Card, CardContent, Button, Input } from '../../components/common';

const mockCourses = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp 2024',
    platform: 'Udemy',
    instructor: 'Angela Yu',
    duration: '48 hours',
    rating: 4.8,
    students: 150000,
    difficulty: 'beginner',
    isFree: false,
    price: '₹499',
    thumbnail: '',
  },
  {
    id: '2',
    title: 'React - The Complete Guide',
    platform: 'Udemy',
    instructor: 'Maximilian Schwarzmüller',
    duration: '52 hours',
    rating: 4.7,
    students: 120000,
    difficulty: 'intermediate',
    isFree: false,
    price: '₹499',
    thumbnail: '',
  },
  {
    id: '3',
    title: 'Python for Data Science',
    platform: 'Coursera',
    instructor: 'IBM',
    duration: '30 hours',
    rating: 4.6,
    students: 80000,
    difficulty: 'beginner',
    isFree: true,
    thumbnail: '',
  },
  {
    id: '4',
    title: 'Machine Learning Specialization',
    platform: 'Coursera',
    instructor: 'Stanford',
    duration: '40 hours',
    rating: 4.9,
    students: 200000,
    difficulty: 'advanced',
    isFree: false,
    price: '₹999',
    thumbnail: '',
  },
  {
    id: '5',
    title: 'UI/UX Design Masterclass',
    platform: 'Figma',
    instructor: 'DesignLab',
    duration: '20 hours',
    rating: 4.5,
    students: 40000,
    difficulty: 'intermediate',
    isFree: true,
    thumbnail: '',
  },
  {
    id: '6',
    title: 'AWS Cloud Practitioner',
    platform: 'AWS',
    instructor: 'AWS Training',
    duration: '15 hours',
    rating: 4.7,
    students: 60000,
    difficulty: 'beginner',
    isFree: true,
    thumbnail: '',
  },
];

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export const CoursesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [saved, setSaved] = useState<string[]>([]);

  const toggleSave = (id: string) => {
    if (saved.includes(id)) {
      setSaved(saved.filter(s => s !== id));
    } else {
      setSaved([...saved, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Courses
          </h1>
          <p className="text-gray-500">
            Learn new skills with expert-led courses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost">Enrolled</Button>
          <Button variant="primary">Saved</Button>
          <Button variant="secondary">All Courses</Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white"
            >
              <option value="">All Platforms</option>
              <option value="udemy">Udemy</option>
              <option value="coursera">Coursera</option>
              <option value="aws">AWS</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCourses
          .filter(course => 
            course.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (difficultyFilter === '' || course.difficulty === difficultyFilter) &&
            (platformFilter === '' || course.platform.toLowerCase() === platformFilter.toLowerCase())
          )
          .map((course) => (
            <Card key={course.id} hover className="!p-0">
              {/* Thumbnail */}
              <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-xl flex items-center justify-center relative">
                <Play className="w-12 h-12 text-white opacity-80" />
                {course.isFree && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
                    FREE
                  </span>
                )}
                <button
                  onClick={() => toggleSave(course.id)}
                  className="absolute top-3 right-3 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${saved.includes(course.id) ? 'fill-current text-red-500' : 'text-white'}`} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">{course.platform}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[course.difficulty as keyof typeof difficultyColors]}`}>
                    {course.difficulty}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-sm text-gray-500 mb-3">
                  {course.instructor}
                </p>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-current text-yellow-500" />
                    {course.rating}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {(course.students / 1000).toFixed(0)}k
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900">
                    {course.price}
                  </span>
                  <Button variant="primary" size="sm">
                    Enroll
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>
    </div>
  );
};
