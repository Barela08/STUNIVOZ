import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Calendar, BookOpen, FileText, Sparkles, ArrowRight, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent, Button, EmptyState, Loading } from '../../components/common';
import { useCollection } from '../../hooks/useCollection';
import type { Course, Event, Internship, InternshipApplication, SavedItem } from '../../types';

export const DashboardPage: React.FC = () => {
  const { profile, user } = useAuth();
  const applications = useCollection<InternshipApplication>('internship_applications');
  const savedItems = useCollection<SavedItem>('saved_items');
  const internships = useCollection<Internship>('internships');
  const events = useCollection<Event>('events');
  const courses = useCollection<Course>('courses');

  const myApplications = applications.data.filter((item) => item.user_id === user?.uid);
  const mySaved = savedItems.data.filter((item) => item.user_id === user?.uid);
  const activeInternships = internships.data.filter((item) => item.status !== 'closed').slice(0, 3);
  const upcomingEvents = events.data
    .filter((event) => new Date(event.date).getTime() >= Date.now())
    .slice(0, 3);
  const recommendedCourses = courses.data.slice(0, 3);

  const stats = [
    { label: 'Applications', value: myApplications.length, icon: FileText, color: 'text-primary-500', bg: 'bg-primary-100' },
    { label: 'Saved', value: mySaved.length, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
    { label: 'Open Internships', value: internships.data.filter((item) => item.status !== 'closed').length, icon: Briefcase, color: 'text-green-500', bg: 'bg-green-100' },
    { label: 'Upcoming Events', value: upcomingEvents.length, icon: Calendar, color: 'text-accent-500', bg: 'bg-accent-100' },
  ];

  const loading = applications.loading || savedItems.loading || internships.loading || events.loading || courses.loading;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 lg:p-8 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold mb-2">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'Student'}
            </h1>
            <p className="text-primary-100 text-lg">Your dashboard is powered by real activity and live platform data.</p>
          </div>
          <Link to="/recommendations">
            <Button variant="secondary" className="bg-white text-primary-600 hover:bg-primary-50">
              <Sparkles className="w-5 h-5" />
              Recommendations
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <Loading text="Loading dashboard..." />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.label} className="!p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg ${stat.bg} flex items-center justify-center`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-500">{stat.label}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Open Internships"
                subtitle="Latest active listings"
                action={<Link to="/internships"><Button variant="ghost" size="sm">View All <ArrowRight className="w-4 h-4" /></Button></Link>}
              />
              <CardContent>
                {activeInternships.length === 0 ? (
                  <EmptyState title="No internships yet" description="Company listings will appear here as soon as they are published." />
                ) : (
                  <div className="divide-y divide-gray-100">
                    {activeInternships.map((internship) => (
                      <div key={internship.id} className="py-4 flex items-center justify-between gap-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">{internship.role}</h3>
                          <p className="text-sm text-gray-500">{internship.company_name} - {internship.location}</p>
                        </div>
                        <Link to="/internships"><Button size="sm">Apply</Button></Link>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Upcoming Events" action={<Link to="/events"><Button variant="ghost" size="sm">View</Button></Link>} />
                <CardContent>
                  {upcomingEvents.length === 0 ? (
                    <EmptyState title="No events" description="Registered and upcoming events will show here." />
                  ) : (
                    <div className="space-y-3">
                      {upcomingEvents.map((event) => (
                        <div key={event.id} className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-accent-500" />
                          <div>
                            <p className="font-medium text-gray-900">{event.title}</p>
                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Courses" action={<Link to="/courses"><Button variant="ghost" size="sm">View</Button></Link>} />
                <CardContent>
                  {recommendedCourses.length === 0 ? (
                    <EmptyState title="No courses" description="Admin-added courses will show here." />
                  ) : (
                    <div className="space-y-3">
                      {recommendedCourses.map((course) => (
                        <div key={course.id} className="flex items-center gap-3">
                          <BookOpen className="w-5 h-5 text-primary-500" />
                          <div>
                            <p className="font-medium text-gray-900">{course.title}</p>
                            <p className="text-xs text-gray-500">{course.platform}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
