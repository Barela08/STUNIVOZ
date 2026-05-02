// User Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?: string;
  role?: 'student' | 'provider' | 'staff' | 'admin';
  location?: string;
  headline?: string;
  bio?: string;
  college_name?: string;
  university?: string;
  degree?: string;
  branch?: string;
  year_of_study?: number;
  cgpa?: number;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  twitter?: string;
  career_interest?: string;
  preferred_locations?: string[];
  job_type_preference?: string;
  company_name?: string;
  company_domain?: string;
  is_verified?: boolean;
  created_at: string;
  updated_at: string;
}

// Skill Types
export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

// Resume Types
export interface Resume {
  id: string;
  user_id: string;
  title: string;
  file_url?: string;
  file_type?: string;
  ats_score?: number;
  ats_keywords?: string[];
  ats_suggestions?: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResumeBuild {
  id: string;
  user_id: string;
  resume_id?: string;
  personal_details: Record<string, any>;
  education: any[];
  skills: string[];
  projects: Project[];
  experience: Experience[];
  certifications: string[];
  achievements: string[];
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  github_link?: string;
  live_link?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  duration: string;
  description: string;
}

// Internship Types
export interface Internship {
  id: string;
  company_name: string;
  company_logo?: string;
  role: string;
  description: string;
  requirements: string;
  location: string;
  stipend: number;
  duration: string;
  remote: boolean;
  skills_required: string[];
  apply_link?: string;
  posted_by?: string;
  status: 'active' | 'closed';
  created_at: string;
}

export interface InternshipApplication {
  id: string;
  user_id: string;
  internship_id: string;
  status: 'applied' | 'pending' | 'shortlisted' | 'rejected';
  applied_at: string;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'hackathon' | 'webinar' | 'workshop' | 'competition';
  date: string;
  end_date?: string;
  location: string;
  virtual: boolean;
  registration_link?: string;
  poster_url?: string;
  organized_by?: string;
  created_at: string;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  registered_at: string;
}

// Course Types
export interface Course {
  id: string;
  title: string;
  platform: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  thumbnail_url?: string;
  course_url: string;
  is_free: boolean;
  skills_covered: string[];
  created_at: string;
}

// Community Types
export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  user?: Profile;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: Profile;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'internship' | 'event' | 'application' | 'system';
  is_read: boolean;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  review_type: 'internship' | 'course' | 'company';
  item_id: string;
  rating: number;
  content: string;
  created_at: string;
}

// Task Types
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  created_at: string;
}

// Gamification Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  points_required: number;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface UserPoints {
  id: string;
  user_id: string;
  points: number;
  updated_at: string;
}

// Career Types
export interface CareerPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills_required: string[];
  created_at: string;
}

export interface RoadmapStep {
  id: string;
  career_path_id: string;
  step_number: number;
  title: string;
  description: string;
  estimated_time: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  resources?: string[];
}

export interface RoadmapProgress {
  id: string;
  user_id: string;
  roadmap_step_id: string;
  completed: boolean;
  completed_at?: string;
}

// Utility Types
export interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'internship' | 'event' | 'course';
  item_id: string;
  saved_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
