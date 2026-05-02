import React, { useMemo, useState } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Search, Filter, Code, Presentation, Lightbulb, Trophy } from 'lucide-react';
import { Card, CardContent, Button, Input, Select, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Event, EventRegistration } from '../../types';

const eventTypeIcons = {
  hackathon: Code,
  webinar: Presentation,
  workshop: Lightbulb,
  competition: Trophy,
};

const eventTypeColors = {
  hackathon: 'bg-purple-100 text-purple-700',
  webinar: 'bg-blue-100 text-blue-700',
  workshop: 'bg-green-100 text-green-700',
  competition: 'bg-yellow-100 text-yellow-700',
};

export const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const events = useCollection<Event>('events');
  const registrations = useCollection<EventRegistration>('event_registrations');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredEvents = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return events.data
      .filter((event) => event.title.toLowerCase().includes(term) || event.description.toLowerCase().includes(term))
      .filter((event) => !typeFilter || event.type === typeFilter);
  }, [events.data, searchTerm, typeFilter]);

  const registeredIds = registrations.data
    .filter((registration) => registration.user_id === user?.uid)
    .map((registration) => registration.event_id);

  const toggleRegistration = async (id: string) => {
    if (!user) return;
    const existing = registrations.data.find((registration) => registration.user_id === user.uid && registration.event_id === id);
    if (existing) {
      await deleteDocument('event_registrations', existing.id);
    } else {
      await addDocument('event_registrations', {
        user_id: user.uid,
        event_id: id,
        registered_at: new Date().toISOString()
      });
    }
    registrations.refresh();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Events</h1>
          <p className="text-gray-500">Hackathons, workshops, webinars and competitions from real providers.</p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
            <Select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              options={[
                { value: '', label: 'All Types' },
                { value: 'hackathon', label: 'Hackathons' },
                { value: 'webinar', label: 'Webinars' },
                { value: 'workshop', label: 'Workshops' },
                { value: 'competition', label: 'Competitions' },
              ]}
            />
            <Button variant="secondary"><Filter className="w-4 h-4" /> Filters</Button>
          </div>
        </CardContent>
      </Card>

      {events.loading ? (
        <Loading text="Loading events..." />
      ) : filteredEvents.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Calendar className="w-6 h-6" />}
            title="No events yet"
            description="When companies or admins publish real events, students can register from here."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const Icon = eventTypeIcons[event.type];
            const color = eventTypeColors[event.type];
            return (
              <Card key={event.id} hover className="!p-0">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">{event.type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4" />{new Date(event.date).toLocaleString()}</div>
                    <div className="flex items-center gap-2"><MapPin className="w-4 h-4" />{event.virtual ? 'Virtual' : event.location}</div>
                    <div className="flex items-center gap-2"><Users className="w-4 h-4" />{registrations.data.filter((item) => item.event_id === event.id).length} registered</div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex gap-2">
                    <Button
                      variant={registeredIds.includes(event.id) ? 'secondary' : 'primary'}
                      className="flex-1"
                      onClick={() => toggleRegistration(event.id)}
                    >
                      {registeredIds.includes(event.id) ? 'Registered' : 'Register'}
                    </Button>
                    {event.registration_link && (
                      <a href={event.registration_link} target="_blank" rel="noreferrer">
                        <Button variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                      </a>
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
