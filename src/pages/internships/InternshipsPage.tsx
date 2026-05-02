import React, { useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase, Heart, ChevronRight, ExternalLink, Building } from 'lucide-react';
import { Card, CardHeader, CardContent, Button, Input, Select } from '../../components/common';

const mockInternships = [
  {
    id: '1',
    company: 'Google',
    companyLogo: '',
    role: 'Frontend Developer Intern',
    location: 'Bangalore',
    stipend: '₹50,000/month',
    duration: '6 months',
    remote: true,
    skills: ['React', 'TypeScript', 'CSS', 'JavaScript'],
    description: 'Join our team to build amazing web experiences.',
    requirements: 'Knowledge of React, strong frontend skills',
    posted: '2 days ago',
    applicants: 156,
  },
  {
    id: '2',
    company: 'Microsoft',
    companyLogo: '',
    role: 'Full Stack Developer',
    location: 'Hyderabad',
    stipend: '₹45,000/month',
    duration: '6 months',
    remote: false,
    skills: ['Node.js', 'React', 'SQL', 'MongoDB'],
    description: 'Work on cutting-edge cloud technologies.',
    requirements: 'Full stack development experience',
    posted: '3 days ago',
    applicants: 89,
  },
  {
    id: '3',
    company: 'Amazon',
    companyLogo: '',
    role: 'SDE Intern',
    location: 'Bangalore',
    stipend: '₹40,000/month',
    duration: '6 months',
    remote: false,
    skills: ['Python', 'AWS', 'Data Structures', 'Algorithms'],
    description: 'Join Amazon Web Services team.',
    requirements: 'Strong DSA fundamentals',
    posted: '5 days ago',
    applicants: 234,
  },
  {
    id: '4',
    company: 'Meta',
    companyLogo: '',
    role: 'Product Design Intern',
    location: 'Bangalore',
    stipend: '₹55,000/month',
    duration: '6 months',
    remote: true,
    skills: ['Figma', 'UI/UX', 'Prototyping'],
    description: 'Design next-gen products.',
    requirements: 'Portfolio required',
    posted: '1 week ago',
    applicants: 178,
  },
  {
    id: '5',
    company: 'Netflix',
    companyLogo: '',
    role: 'Data Science Intern',
    location: 'Mumbai',
    stipend: '₹60,000/month',
    duration: '6 months',
    remote: false,
    skills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
    description: 'Work on recommendation systems.',
    requirements: 'ML knowledge required',
    posted: '4 days ago',
    applicants: 112,
  },
];

export const InternshipsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    location: '',
    stipend: '',
    remote: '',
    skills: '',
  });
  const [saved, setSaved] = useState<string[]>([]);
  const [view, setView] = useState<'grid' | 'list'>('list');

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
            Find Internships
          </h1>
          <p className="text-gray-500">
            {mockInternships.length} internships available
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={view === 'list' ? 'primary' : 'secondary'} 
            onClick={() => setView('list')}
          >
            List
          </Button>
          <Button 
            variant={view === 'grid' ? 'primary' : 'secondary'} 
            onClick={() => setView('grid')}
          >
            Grid
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by role, company, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<Search className="w-5 h-5" />}
              />
            </div>
            <Select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              options={[
                { value: '', label: 'All Locations' },
                { value: 'bangalore', label: 'Bangalore' },
                { value: 'mumbai', label: 'Mumbai' },
                { value: 'hyderabad', label: 'Hyderabad' },
                { value: 'remote', label: 'Remote' },
              ]}
            />
            <Select
              value={filters.stipend}
              onChange={(e) => setFilters({ ...filters, stipend: e.target.value })}
              options={[
                { value: '', label: 'All Stipends' },
                { value: '30k', label: '₹30k+' },
                { value: '40k', label: '₹40k+' },
                { value: '50k', label: '₹50k+' },
              ]}
            />
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Internships List */}
      <div className="space-y-4">
        {mockInternships
          .filter(internship => 
            internship.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            internship.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
          )
          .map((internship) => (
            <Card key={internship.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Company Info */}
                <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Building className="w-8 h-8 text-primary-500" />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {internship.role}
                      </h3>
                      <p className="text-gray-600">{internship.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {internship.location}
                      {internship.remote && ' (Remote)'}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {internship.stipend}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {internship.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {internship.applicants} applicants
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-3">
                    {internship.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500 mt-3">
                    {internship.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSave(internship.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      saved.includes(internship.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${saved.includes(internship.id) ? 'fill-current' : ''}`} />
                  </button>
                  <Button variant="primary">
                    Apply Now
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost">
                    Details
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="ghost">Previous</Button>
        <Button variant="primary">1</Button>
        <Button variant="ghost">2</Button>
        <Button variant="ghost">3</Button>
        <Button variant="ghost">Next</Button>
      </div>
    </div>
  );
};
