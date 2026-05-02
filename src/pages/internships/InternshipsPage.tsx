import React, { useMemo, useState } from 'react';
import { Search, Filter, MapPin, DollarSign, Clock, Briefcase, Heart, ChevronRight, ExternalLink, Building } from 'lucide-react';
import { Card, CardContent, Button, Input, Select, EmptyState, Loading } from '../../components/common';
import { addDocument, deleteDocument, getCollectionWhere } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useCollection } from '../../hooks/useCollection';
import type { Internship, SavedItem } from '../../types';

export const InternshipsPage: React.FC = () => {
  const { user } = useAuth();
  const internships = useCollection<Internship>('internships');
  const savedItems = useCollection<SavedItem>('saved_items');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ location: '', stipend: '', remote: '' });
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [applyingId, setApplyingId] = useState<string | null>(null);

  const savedInternshipIds = savedItems.data
    .filter((item) => item.user_id === user?.uid && item.item_type === 'internship')
    .map((item) => item.item_id);

  const filteredInternships = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return internships.data
      .filter((internship) => internship.status !== 'closed')
      .filter((internship) => {
        const searchable = [
          internship.role,
          internship.company_name,
          internship.location,
          internship.description,
          ...(internship.skills_required || [])
        ].join(' ').toLowerCase();
        return searchable.includes(term);
      })
      .filter((internship) => !filters.location || internship.location.toLowerCase().includes(filters.location))
      .filter((internship) => !filters.remote || String(internship.remote) === filters.remote);
  }, [internships.data, searchTerm, filters]);

  const toggleSave = async (id: string) => {
    if (!user) return;
    const existing = savedItems.data.find((item) => item.user_id === user.uid && item.item_type === 'internship' && item.item_id === id);
    if (existing) {
      await deleteDocument('saved_items', existing.id);
    } else {
      await addDocument('saved_items', {
        user_id: user.uid,
        item_type: 'internship',
        item_id: id,
        saved_at: new Date().toISOString()
      });
    }
    savedItems.refresh();
  };

  const applyToInternship = async (internship: Internship) => {
    if (!user) return;
    setApplyingId(internship.id);
    const existing = await getCollectionWhere('internship_applications', 'user_id', '==', user.uid);
    const alreadyApplied = existing.success && (existing.data as Array<{ internship_id?: string }> | undefined)?.some((item) => item.internship_id === internship.id);
    if (!alreadyApplied) {
      await addDocument('internship_applications', {
        user_id: user.uid,
        internship_id: internship.id,
        provider_id: internship.posted_by || '',
        status: 'pending',
        applied_at: new Date().toISOString()
      });
    }
    setApplyingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Find Internships</h1>
          <p className="text-gray-500">{filteredInternships.length} active listings</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === 'list' ? 'primary' : 'secondary'} onClick={() => setView('list')}>List</Button>
          <Button variant={view === 'grid' ? 'primary' : 'secondary'} onClick={() => setView('grid')}>Grid</Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by role, company, or skill..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              icon={<Search className="w-5 h-5" />}
            />
            <Select
              value={filters.location}
              onChange={(event) => setFilters({ ...filters, location: event.target.value })}
              options={[
                { value: '', label: 'All Locations' },
                { value: 'remote', label: 'Remote' },
                { value: 'bangalore', label: 'Bangalore' },
                { value: 'mumbai', label: 'Mumbai' },
                { value: 'hyderabad', label: 'Hyderabad' },
              ]}
            />
            <Select
              value={filters.remote}
              onChange={(event) => setFilters({ ...filters, remote: event.target.value })}
              options={[
                { value: '', label: 'Any Workplace' },
                { value: 'true', label: 'Remote' },
                { value: 'false', label: 'On-site or Hybrid' },
              ]}
            />
            <Button variant="secondary">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {internships.loading ? (
        <Loading text="Loading internships..." />
      ) : filteredInternships.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Briefcase className="w-6 h-6" />}
            title="No internships available"
            description="Real internship listings posted by verified companies will appear here."
          />
        </Card>
      ) : (
        <div className={view === 'grid' ? 'grid lg:grid-cols-2 gap-4' : 'space-y-4'}>
          {filteredInternships.map((internship) => (
            <Card key={internship.id} hover>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                <div className="w-16 h-16 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                  <Building className="w-8 h-8 text-primary-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">{internship.role}</h3>
                      <p className="text-gray-600">{internship.company_name}</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">Active</span>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{internship.location}</span>
                    <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" />{internship.stipend || 'Not disclosed'}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{internship.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(internship.skills_required || []).map((skill) => (
                      <span key={skill} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">{skill}</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-3 line-clamp-2">{internship.description}</p>
                </div>
                <div className="flex lg:flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => toggleSave(internship.id)}
                    className={`p-2 rounded-lg border transition-colors ${
                      savedInternshipIds.includes(internship.id)
                        ? 'bg-red-50 border-red-200 text-red-500'
                        : 'border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${savedInternshipIds.includes(internship.id) ? 'fill-current' : ''}`} />
                  </button>
                  <Button variant="primary" loading={applyingId === internship.id} onClick={() => applyToInternship(internship)}>
                    Apply
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  {internship.apply_link && (
                    <a href={internship.apply_link} target="_blank" rel="noreferrer">
                      <Button variant="ghost">
                        Details
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </a>
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
