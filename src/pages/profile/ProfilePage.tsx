import React, { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Linkedin, Github, Globe, Twitter, Edit, Save, Plus, X, Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardHeader, CardContent, Button, Input, Textarea } from '../../components/common';

export const ProfilePage: React.FC = () => {
  const { profile, updateProfile, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    headline: profile?.headline || '',
    phone: profile?.phone || '',
    location: profile?.location || '',
    bio: profile?.bio || '',
    college_name: profile?.college_name || '',
    university: profile?.university || '',
    degree: profile?.degree || '',
    branch: profile?.branch || '',
    year_of_study: profile?.year_of_study || 0,
    cgpa: profile?.cgpa || 0,
    linkedin: profile?.linkedin || '',
    github: profile?.github || '',
    portfolio: profile?.portfolio || '',
    twitter: profile?.twitter || '',
    career_interest: profile?.career_interest || '',
    preferred_locations: profile?.preferred_locations || [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [skills, setSkills] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    await updateProfile(formData);
    setEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Profile Header */}
      <Card padding="none">
        <div className="relative">
          <div className="h-32 bg-gradient-to-r from-primary-500 to-primary-600 rounded-t-xl" />
          <div className="absolute -bottom-12 left-6">
            <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
              <div className="w-full h-full bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-3xl font-bold">
                  {profile?.full_name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          </div>
          <div className="absolute top-4 right-4">
            <Button variant="secondary" onClick={() => setEditing(!editing)}>
              {editing ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
              {editing ? 'Save' : 'Edit Profile'}
            </Button>
          </div>
        </div>
        <div className="pt-16 pb-6 px-6">
          <h1 className="font-display text-2xl font-bold text-gray-900">
            {profile?.full_name || 'Full Name'}
          </h1>
          <p className="text-gray-500">{profile?.headline || 'Add your headline'}</p>
          <p className="text-gray-500 mt-1">{profile?.email || user?.email}</p>
          <div className="flex flex-wrap gap-4 mt-3">
            {profile?.location && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </span>
            )}
            {profile?.phone && (
              <span className="flex items-center gap-1 text-sm text-gray-500">
                <Phone className="w-4 h-4" />
                {profile.phone}
              </span>
            )}
          </div>
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
              {profile?.bio || 'No bio added yet. Click edit to add one.'}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Education */}
      <Card>
        <CardHeader title="Education" subtitle="Your academic background" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="College Name"
              name="college_name"
              value={formData.college_name}
              onChange={handleChange}
              placeholder="Your college"
              disabled={!editing}
            />
            <Input
              label="University"
              name="university"
              value={formData.university}
              onChange={handleChange}
              placeholder="Your university"
              disabled={!editing}
            />
            <Input
              label="Degree"
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              placeholder="B.Tech, B.Sc, etc."
              disabled={!editing}
            />
            <Input
              label="Branch"
              name="branch"
              value={formData.branch}
              onChange={handleChange}
              placeholder="Computer Science, etc."
              disabled={!editing}
            />
            <Input
              label="Year of Study"
              name="year_of_study"
              type="number"
              value={formData.year_of_study}
              onChange={handleChange}
              placeholder="1, 2, 3, 4..."
              disabled={!editing}
            />
            <Input
              label="CGPA"
              name="cgpa"
              type="number"
              value={formData.cgpa}
              onChange={handleChange}
              placeholder="0.00"
              disabled={!editing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card>
        <CardHeader 
          title="Skills" 
          subtitle="Add your technical skills"
          action={
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="w-40"
              />
              <Button variant="primary" size="sm" onClick={addSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          }
        />
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full flex items-center gap-2"
              >
                {skill}
                <button onClick={() => removeSkill(index)}>
                  <X className="w-4 h-4" />
                </button>
              </span>
            ))}
            {skills.length === 0 && !newSkill && (
              <p className="text-gray-500">No skills added yet.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader title="Social Links" subtitle="Your online presence" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="LinkedIn"
              name="linkedin"
              value={formData.linkedin}
              onChange={handleChange}
              placeholder="linkedin.com/in/username"
              icon={<Linkedin className="w-5 h-5" />}
              disabled={!editing}
            />
            <Input
              label="GitHub"
              name="github"
              value={formData.github}
              onChange={handleChange}
              placeholder="github.com/username"
              icon={<Github className="w-5 h-5" />}
              disabled={!editing}
            />
            <Input
              label="Portfolio"
              name="portfolio"
              value={formData.portfolio}
              onChange={handleChange}
              placeholder="yourportfolio.com"
              icon={<Globe className="w-5 h-5" />}
              disabled={!editing}
            />
            <Input
              label="Twitter"
              name="twitter"
              value={formData.twitter}
              onChange={handleChange}
              placeholder="twitter.com/username"
              icon={<Twitter className="w-5 h-5" />}
              disabled={!editing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Career Preferences */}
      <Card>
        <CardHeader title="Career Preferences" subtitle="What kind of opportunities are you looking for?" />
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label="Career Interest"
              name="career_interest"
              value={formData.career_interest}
              onChange={handleChange}
              placeholder="Web Developer, Data Scientist, etc."
              disabled={!editing}
            />
            <Input
              label="Preferred Locations"
              name="preferred_locations"
              value={formData.preferred_locations?.join(', ')}
              onChange={(e) => setFormData({ ...formData, preferred_locations: e.target.value.split(', ') })}
              placeholder="Bangalore, Remote, etc."
              disabled={!editing}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
