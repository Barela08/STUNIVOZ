import React, { useState, useEffect } from 'react';
import { Search, Clock, Star, Users, ExternalLink, Play, Heart, Loader2, Inbox } from 'lucide-react';
import { Card, CardContent, Button, Input } from '../../components/common';
import { subscribeToCourses, FirestoreCourse } from '../../services/contentService';

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  intermediate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  advanced: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<FirestoreCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribeToCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filtered = courses.filter(c => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q) || c.platform.toLowerCase().includes(q);
    const matchDifficulty = !difficultyFilter || c.level?.toLowerCase() === difficultyFilter;
    const matchPlatform = !platformFilter || c.platform?.toLowerCase() === platformFilter;
    return matchSearch && matchDifficulty && matchPlatform && c.status !== 'draft';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-gray-500 dark:text-gray-400">Learn new skills with expert-led courses</p>
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
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            >
              <option value="">All Platforms</option>
              <option value="udemy">Udemy</option>
              <option value="coursera">Coursera</option>
              <option value="nptel">NPTEL</option>
              <option value="aws">AWS</option>
              <option value="youtube">YouTube</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading courses...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No courses yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {searchTerm ? 'No results match your search.' : 'No courses have been added yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Courses Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <Card key={course.id} hover className="!p-0">
              <div className="h-40 bg-gradient-to-br from-primary-400 to-primary-600 rounded-t-xl flex items-center justify-center relative">
                <Play className="w-12 h-12 text-white opacity-80" />
                {course.isFree && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded-lg">FREE</span>
                )}
                <button
                  onClick={() => toggleSave(course.id!)}
                  className="absolute top-3 right-3 p-2 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
                >
                  <Heart className={`w-4 h-4 ${saved.includes(course.id!) ? 'fill-current text-red-400' : 'text-white'}`} />
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{course.platform}</span>
                  {course.level && (
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[course.level.toLowerCase()] || 'bg-gray-100 text-gray-600'}`}>
                      {course.level}
                    </span>
                  )}
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{course.instructor}</p>

                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {course.duration && <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>}
                  {course.rating > 0 && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current text-yellow-500" />{course.rating}</span>}
                  {course.students > 0 && <span className="flex items-center gap-1"><Users className="w-4 h-4" />{course.students > 999 ? `${(course.students/1000).toFixed(0)}k` : course.students}</span>}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {course.isFree ? 'Free' : course.price || '—'}
                  </span>
                  {course.link ? (
                    <a href={course.link} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary" size="sm">
                        Enroll <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="primary" size="sm" disabled>Enroll</Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
