import React, { useState, useEffect } from 'react';
import { Phone, MapPin, Linkedin, Github, Globe, Twitter, Edit, Save, Plus, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    headline: '',
    phone: '',
    location: '',
    bio: '',
    college_name: '',
    university: '',
    degree: '',
    branch: '',
    year_of_study: 0,
    cgpa: 0,
    linkedin: '',
    github: '',
    portfolio: '',
    twitter: '',
    career_interest: '',
    preferred_locations: [] as string[],
  });

  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  // Sync form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        college_name: profile.college_name || '',
        university: profile.university || '',
        degree: profile.degree || '',
        branch: profile.branch || '',
        year_of_study: profile.year_of_study || 0,
        cgpa: profile.cgpa || 0,
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        twitter: profile.twitter || '',
        career_interest: profile.career_interest || '',
        preferred_locations: profile.preferred_locations || [],
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus('idle');
    setErrorMsg('');
    try {
      const { error } = await updateProfile(formData);
      if (error) {
        setSaveStatus('error');
        setErrorMsg((error as any)?.message || 'Failed to save profile. Please try again.');
      } else {
        setSaveStatus('success');
        setEditing(false);
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (err: any) {
      setSaveStatus('error');
      setErrorMsg(err?.message || 'An unexpected error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditToggle = () => {
    if (editing) {
      handleSave();
    } else {
      setEditing(true);
      setSaveStatus('idle');
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        headline: profile.headline || '',
        phone: profile.phone || '',
        location: profile.location || '',
        bio: profile.bio || '',
        college_name: profile.college_name || '',
        university: profile.university || '',
        degree: profile.degree || '',
        branch: profile.branch || '',
        year_of_study: profile.year_of_study || 0,
        cgpa: profile.cgpa || 0,
        linkedin: profile.linkedin || '',
        github: profile.github || '',
        portfolio: profile.portfolio || '',
        twitter: profile.twitter || '',
        career_interest: profile.career_interest || '',
        preferred_locations: profile.preferred_locations || [],
      });
    }
    setEditing(false);
    setSaveStatus('idle');
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(prev => prev.filter((_, i) => i !== index));
  };

  const displayName = editing ? formData.full_name : (profile?.full_name || 'Your Name');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Status Alerts */}
      {saveStatus === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-700 font-medium">Profile saved successfully!</p>
        </div>
      )}
      {saveStatus === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Profile Header */}
      <Card padding="none">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl" />
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-3xl font-bold">
                  {displayName?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4 flex gap-2">
            {editing && (
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                <X className="w-4 h-4" />
                Cancel
              </Button>
            )}
            <Button variant="primary" onClick={handleEditToggle} loading={saving}>
              {editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {editing ? (saving ? 'Saving…' : 'Save Profile') : 'Edit Profile'}
            </Button>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          {editing ? (
            <div className="space-y-3 max-w-md">
              <Input
                label="Full Name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Your full name"
              />
              <Input
                label="Headline"
                name="headline"
                value={formData.headline}
                onChange={handleChange}
                placeholder="e.g. Aspiring Software Engineer"
              />
            </div>
          ) : (
            <>
              <h1 className="font-display text-2xl font-bold text-gray-900">{displayName}</h1>
              <p className="text-gray-500">{profile?.headline || 'Add your headline'}</p>
              <p className="text-gray-500 mt-1">{profile?.email || user?.email}</p>
              <div className="flex flex-wrap gap-4 mt-3">
                {profile?.location && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />{profile.location}
                  </span>
                )}
                {profile?.phone && (
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="w-4 h-4" />{profile.phone}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
      </Card>

      {/* About */}
      <Card>
        <CardHeader title="About" subtitle="Tell us about yourself" />
        <CardContent>
          {editing ? (
            <Textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Write something about yourself..."
              rows={4}
            />
          ) : (
            <p className="text-gray-600">
              {profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Contact */}
      {editing && (
        <Card>
          <CardHeader title="Contact Information" />
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 9876543210" />
              <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="Bangalore, India" icon={<MapPin className="w-5 h-5" />} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Education */}
      <Card>
        <CardHeader title="Education" subtitle="Your academic background" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="College Name" name="college_name" value={formData.college_name} onChange={handleChange} placeholder="Your college" disabled={!editing} />
            <Input label="University" name="university" value={formData.university} onChange={handleChange} placeholder="Your university" disabled={!editing} />
            <Input label="Degree" name="degree" value={formData.degree} onChange={handleChange} placeholder="B.Tech, B.Sc, etc." disabled={!editing} />
            <Input label="Branch" name="branch" value={formData.branch} onChange={handleChange} placeholder="Computer Science, etc." disabled={!editing} />
            <Input label="Year of Study" name="year_of_study" type="number" value={formData.year_of_study || ''} onChange={handleChange} placeholder="1, 2, 3, 4..." disabled={!editing} />
            <Input label="CGPA" name="cgpa" type="number" value={formData.cgpa || ''} onChange={handleChange} placeholder="0.00" disabled={!editing} />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader
          title="Skills"
          subtitle="Add your technical skills"
          action={
            editing ? (
              <div className="flex gap-2">
                <Input
                  placeholder="Add a skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                  className="w-40"
                />
                <Button variant="primary" size="sm" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ) : undefined
          }
        />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span key={index} className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full flex items-center gap-2 text-sm">
                {skill}
                {editing && (
                  <button onClick={() => removeSkill(index)} className="hover:text-primary-900">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
            {skills.length === 0 && (
              <p className="text-gray-500 text-sm">{editing ? 'Type a skill and press Enter or click +' : 'No skills added yet.'}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader title="Social Links" subtitle="Your online presence" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="LinkedIn" name="linkedin" value={formData.linkedin} onChange={handleChange} placeholder="linkedin.com/in/username" icon={<Linkedin className="w-5 h-5" />} disabled={!editing} />
            <Input label="GitHub" name="github" value={formData.github} onChange={handleChange} placeholder="github.com/username" icon={<Github className="w-5 h-5" />} disabled={!editing} />
            <Input label="Portfolio" name="portfolio" value={formData.portfolio} onChange={handleChange} placeholder="yourportfolio.com" icon={<Globe className="w-5 h-5" />} disabled={!editing} />
            <Input label="Twitter" name="twitter" value={formData.twitter} onChange={handleChange} placeholder="twitter.com/username" icon={<Twitter className="w-5 h-5" />} disabled={!editing} />
          </div>
        </CardContent>
      </Card>

      {/* Career Preferences */}
      <Card>
        <CardHeader title="Career Preferences" subtitle="What kind of opportunities are you looking for?" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="Career Interest" name="career_interest" value={formData.career_interest} onChange={handleChange} placeholder="Web Developer, Data Scientist, etc." disabled={!editing} />
            <Input
              label="Preferred Locations"
              name="preferred_locations"
              value={formData.preferred_locations?.join(', ')}
              onChange={(e) => setFormData(prev => ({ ...prev, preferred_locations: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }))}
              placeholder="Bangalore, Remote, etc."
              disabled={!editing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Bottom Save Button (visible while editing) */}
      {editing && (
        <div className="flex justify-end gap-3 pb-4">
          <Button variant="secondary" onClick={handleCancel} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Save className="w-4 h-4" />
            {saving ? 'Saving…' : 'Save Profile'}
          </Button>
        </div>
      )}
    </div>
  );
};
