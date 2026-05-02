import React, { useMemo, useState } from 'react';
import { Search, Clock, Star, ExternalLink, Play, Heart, BookOpen } from 'lucide-react';
import { Card, Button, Input, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Course, SavedItem } from '../../types';

const difficultyColors = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
};

export const CoursesPage: React.FC = () => {
  const { user } = useAuth();
  const courses = useCollection<Course>('courses');
  const savedItems = useCollection<SavedItem>('saved_items');
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [platformFilter, setPlatformFilter] = useState('');

  const savedCourseIds = savedItems.data
    .filter((item) => item.user_id === user?.uid && item.item_type === 'course')
    .map((item) => item.item_id);

  const filteredCourses = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return courses.data
      .filter((course) => `${course.title} ${course.platform} ${course.description}`.toLowerCase().includes(term))
      .filter((course) => !difficultyFilter || course.difficulty === difficultyFilter)
      .filter((course) => !platformFilter || course.platform.toLowerCase().includes(platformFilter.toLowerCase()));
  }, [courses.data, searchTerm, difficultyFilter, platformFilter]);

  const toggleSave = async (id: string) => {
    if (!user) return;
    const existing = savedItems.data.find((item) => item.user_id === user.uid && item.item_type === 'course' && item.item_id === id);
    if (existing) {
      await deleteDocument('saved_items', existing.id);
    } else {
      await addDocument('saved_items', {
        user_id: user.uid,
        item_type: 'course',
        item_id: id,
        saved_at: new Date().toISOString()
      });
    }
    savedItems.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900">Courses</h1>
        <p className="text-gray-500">Real courses added by admins and providers.</p>
      </div>

      <Card>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            icon={<Search className="w-5 h-5" />}
          />
          <select value={difficultyFilter} onChange={(event) => setDifficultyFilter(event.target.value)} className="px-4 py-2.5 rounded-lg border border-gray-200 bg-white">
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <Input placeholder="Platform" value={platformFilter} onChange={(event) => setPlatformFilter(event.target.value)} />
        </div>
      </Card>

      {courses.loading ? (
        <Loading text="Loading courses..." />
      ) : filteredCourses.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BookOpen className="w-6 h-6" />}
            title="No courses available"
            description="Add course documents to Firestore to make them available to students."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} hover className="!p-0">
              <div className="h-40 bg-gray-100 rounded-t-lg flex items-center justify-center relative">
                {course.thumbnail_url ? (
                  <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover rounded-t-lg" />
                ) : (
                  <Play className="w-12 h-12 text-gray-400" />
                )}
                {course.is_free && <span className="absolute top-3 left-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">FREE</span>}
                <button onClick={() => toggleSave(course.id)} className="absolute top-3 right-3 p-2 bg-white/80 rounded-full hover:bg-white">
                  <Heart className={`w-4 h-4 ${savedCourseIds.includes(course.id) ? 'fill-current text-red-500' : 'text-gray-500'}`} />
                </button>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-gray-500">{course.platform}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${difficultyColors[course.difficulty]}`}>{course.difficulty}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{course.description}</p>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{course.duration}</span>
                  {course.rating && <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-current text-yellow-500" />{course.rating}</span>}
                </div>
                <a href={course.course_url} target="_blank" rel="noreferrer">
                  <Button variant="primary" size="sm" className="w-full">
                    Open Course
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
