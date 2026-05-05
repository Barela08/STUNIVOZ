import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase, Heart, ChevronRight, ExternalLink, Building, Loader2, Inbox } from 'lucide-react';
import { Card, CardContent, Button, Input, Select } from '../../components/common';
import { subscribeToInternships, FirestoreInternship } from '../../services/contentService';

export const InternshipsPage: React.FC = () => {
  const [internships, setInternships] = useState<FirestoreInternship[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', stipend: '', remote: '' });
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const unsub = subscribeToInternships((data) => {
      setInternships(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const toggleSave = (id: string) => {
    setSaved(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const filtered = internships.filter(i => {
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || i.title.toLowerCase().includes(q) || i.company.toLowerCase().includes(q) || i.skills.toLowerCase().includes(q);
    const matchLocation = !filters.location || i.location.toLowerCase().includes(filters.location);
    return matchSearch && matchLocation && i.status !== 'draft';
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Find Internships</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {loading ? 'Loading...' : `${filtered.length} internship${filtered.length !== 1 ? 's' : ''} available`}
          </p>
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
                { value: 'delhi', label: 'Delhi' },
                { value: 'remote', label: 'Remote' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading internships...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">No internships yet</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            {searchTerm ? 'No results match your search. Try different keywords.' : 'The admin hasn\'t posted any internships yet. Check back soon!'}
          </p>
        </div>
      )}

      {/* Internships List */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((internship) => (
            <Card key={internship.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <Building className="w-7 h-7 text-primary-500" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{internship.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400">{internship.company}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {internship.verified && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-medium">Verified</span>
                      )}
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-medium">Active</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{internship.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{internship.stipend}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{internship.duration}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{internship.type}</span>
                  </div>

                  {internship.skills && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {internship.skills.split(',').map((skill) => (
                        <span key={skill.trim()} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg text-xs">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {internship.description && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 line-clamp-2">{internship.description}</p>
                  )}
                </div>

                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSave(internship.id!)}
                    className={`p-2 rounded-lg border transition-colors ${saved.includes(internship.id!) ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                  >
                    <Heart className={`w-5 h-5 ${saved.includes(internship.id!) ? 'fill-current' : ''}`} />
                  </button>
                  {internship.applyUrl ? (
                    <a href={internship.applyUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="primary">
                        Apply Now <ChevronRight className="w-4 h-4" />
                      </Button>
                    </a>
                  ) : (
                    <Button variant="primary" disabled>Apply Now</Button>
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
