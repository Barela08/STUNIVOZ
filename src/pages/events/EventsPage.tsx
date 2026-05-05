import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Search, Filter, Code, Presentation, Lightbulb, Trophy, Loader2, Inbox } from 'lucide-react';
import { Card, CardContent, Button, Input, Select } from '../../components/common';
import { subscribeToEvents, FirestoreEvent } from '../../services/contentService';

const eventTypeIcons: Record<string, React.ElementType> = {
  hackathon: Code,
  webinar: Presentation,
  workshop: Lightbulb,
  competition: Trophy,
};

const eventTypeColors: Record<string, string> = {
  hackathon: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  webinar: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  workshop: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  competition: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

const eventBarColors: Record<string, string> = {
  hackathon: 'bg-purple-500',
  webinar: 'bg-blue-500',
  workshop: 'bg-green-500',
  competition: 'bg-yellow-500',
};

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<FirestoreEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    const unsub = subscribeToEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = events.filter(e => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || e.title.toLowerCase().includes(q) || e.host.toLowerCase().includes(q);
    const matchType = !typeFilter || e.type === typeFilter;
    return matchSearch && matchType && e.status !== 'draft';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Events</h1>
          <p className="text-gray-500 dark:text-gray-400">Hackathons, workshops, webinars and more</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'hackathon', label: 'Hackathons' },
                { value: 'webinar', label: 'Webinars' },
                { value: 'workshop', label: 'Workshops' },
                { value: 'competition', label: 'Competitions' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading events...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No events yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {searchTerm ? 'No results match your search.' : 'No events have been posted yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Events Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((event) => {
            const typeKey = event.type?.toLowerCase() || 'webinar';
            const Icon = eventTypeIcons[typeKey] || Calendar;
            return (
              <Card key={event.id} hover className="!p-0">
                <div className={`h-2 rounded-t-xl ${eventBarColors[typeKey] || 'bg-primary-500'}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${eventTypeColors[typeKey] || 'bg-gray-100 text-gray-600'} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-2">
                      {event.verified && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">✓ Verified</span>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-medium">{event.type}</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{event.title}</h3>

                  <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{event.date}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.location}</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" />{event.registrations} registered</div>
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{event.description}</p>
                  )}

                  <div className="flex gap-2">
                    {event.link ? (
                      <a href={event.link} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="primary" className="w-full">
                          Register <ExternalLink className="w-4 h-4" />
                        </Button>
                      </a>
                    ) : (
                      <Button variant="primary" className="flex-1" disabled>Register</Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
