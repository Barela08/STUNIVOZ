import React, { useState } from 'react';
import { Calendar, MapPin, Users, ExternalLink, Search, Filter, Code, Presentation, Lightbulb, Trophy } from 'lucide-react';
import { Card, CardContent, Button, Input, Select } from '../../components/common';

const mockEvents = [
  {
    id: '1',
    title: 'Google Cloud Hackathon 2024',
    type: 'hackathon',
    date: 'Dec 15-17, 2024',
    location: 'Virtual',
    organizedBy: 'Google',
    description: '48-hour hackathon to build innovative solutions using Google Cloud.',
    registrationLink: '#',
    participants: 500,
    prize: '$10,000',
  },
  {
    id: '2',
    title: 'AWS Career Workshop',
    type: 'webinar',
    date: 'Dec 18, 2024',
    location: 'Virtual',
    organizedBy: 'AWS',
    description: 'Learn about cloud careers and get resume tips from AWS professionals.',
    registrationLink: '#',
    participants: 200,
  },
  {
    id: '3',
    title: 'React Masterclass',
    type: 'workshop',
    date: 'Dec 20, 2024',
    location: 'Bangalore',
    organizedBy: 'Udemy',
    description: 'Advanced React patterns and performance optimization techniques.',
    registrationLink: '#',
    participants: 50,
  },
  {
    id: '4',
    title: 'CodeSprint Championship',
    type: 'competition',
    date: 'Jan 5, 2025',
    location: 'Virtual',
    organizedBy: 'CodeChef',
    description: 'Competitive programming championship with exciting prizes.',
    registrationLink: '#',
    participants: 1000,
    prize: '₹50,000',
  },
  {
    id: '5',
    title: 'Product Design Bootcamp',
    type: 'workshop',
    date: 'Jan 10, 2025',
    location: 'Mumbai',
    organizedBy: 'Figma',
    description: 'Intensive bootcamp covering all aspects of product design.',
    registrationLink: '#',
    participants: 30,
  },
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [registered, setRegistered] = useState<string[]>([]);

  const registerForEvent = (id: string) => {
    if (registered.includes(id)) {
      setRegistered(registered.filter(r => r !== id));
    } else {
      setRegistered([...registered, id]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Events
          </h1>
          <p className="text-gray-500">
            Hackathons, workshops, webinars and more
          </p>
        </div>
        <Button variant="primary">
          <Calendar className="w-4 h-4" />
          My Calendar
        </Button>
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
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockEvents
          .filter(event => 
            event.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            (typeFilter === '' || event.type === typeFilter)
          )
          .map((event) => {
            const Icon = eventTypeIcons[event.type as keyof typeof eventTypeIcons];
            return (
              <Card key={event.id} hover className="!p-0">
                <div className={`h-2 ${eventTypeColors[event.type as keyof typeof eventTypeColors].split(' ')[0].replace('bg-', 'bg-')}`} />
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-lg ${eventTypeColors[event.type as keyof typeof eventTypeColors]} flex items-center justify-center`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs text-gray-500 uppercase font-medium">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-2">
                    {event.title}
                  </h3>

                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {event.participants} participants
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  {event.prize && (
                    <div className="text-sm font-medium text-green-600 mb-4">
                      Prize: {event.prize}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button 
                      variant={registered.includes(event.id) ? 'secondary' : 'primary'}
                      className="flex-1"
                      onClick={() => registerForEvent(event.id)}
                    >
                      {registered.includes(event.id) ? 'Registered' : 'Register'}
                    </Button>
                    <Button variant="ghost">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
      </div>
    </div>
  );
};
