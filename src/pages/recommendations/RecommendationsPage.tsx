import React from 'react';
import { Card, CardHeader, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Course, Internship } from '../../types';

export const RecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const internships = useCollection<Internship>('internships');
  const courses = useCollection<Course>('courses');
  const interests = [
    profile?.career_interest,
    profile?.branch,
    ...(profile?.preferred_locations || [])
  ].filter(Boolean).join(' ').toLowerCase();

  const recommendedInternships = internships.data
    .filter((item) => item.status !== 'closed')
    .filter((item) => {
      if (!interests) return true;
      return `${item.role} ${item.company_name} ${item.location} ${(item.skills_required || []).join(' ')}`.toLowerCase().includes(interests);
    })
    .slice(0, 3);

  const recommendedCourses = courses.data
    .filter((course) => {
      if (!profile?.career_interest) return true;
      return `${course.title} ${course.description} ${(course.skills_covered || []).join(' ')}`.toLowerCase().includes(profile.career_interest.toLowerCase());
    })
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-accent-500 to-primary-500 rounded-lg p-6 lg:p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold">Recommendations</h1>
            <p className="text-accent-100 mt-1">Matched from your profile and real platform data.</p>
          </div>
        </div>
      </div>

      {internships.loading || courses.loading ? (
        <Loading text="Loading recommendations..." />
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader title="Internships for You" />
            <CardContent className="space-y-4">
              {recommendedInternships.length === 0 ? (
                <EmptyState title="No matches yet" description="Complete your profile or wait for companies to add matching listings." />
              ) : (
                recommendedInternships.map((internship) => (
                  <div key={internship.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900">{internship.role}</h4>
                    <p className="text-sm text-gray-500 mb-2">{internship.company_name} - {internship.location}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(internship.skills_required || []).slice(0, 4).map((skill) => (
                        <span key={skill} className="text-xs px-2 py-1 bg-white rounded-md border border-gray-200">{skill}</span>
                      ))}
                    </div>
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Recommended Courses" />
            <CardContent className="space-y-4">
              {recommendedCourses.length === 0 ? (
                <EmptyState title="No courses yet" description="Admins can add real courses to power recommendations." />
              ) : (
                recommendedCourses.map((course) => (
                  <div key={course.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <h4 className="font-bold text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500 mb-2">{course.platform} - {course.difficulty}</p>
                    <a href={course.course_url} target="_blank" rel="noreferrer">
                      <Button variant="outline" size="sm" className="w-full text-accent-600 border-accent-200 hover:bg-accent-50">Open Course</Button>
                    </a>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
