import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Storage ─────────────────────────────────────────────────────────────────

export type StorageBucket = 'images' | 'pdfs' | 'videos' | 'texts';

const ALLOWED_TYPES: Record<StorageBucket, string[]> = {
  images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  pdfs:   ['application/pdf'],
  videos: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  texts:  ['text/plain', 'text/csv', 'text/html', 'text/markdown', 'application/json'],
};

export function getBucketForFile(file: File): StorageBucket | null {
  for (const [bucket, types] of Object.entries(ALLOWED_TYPES) as [StorageBucket, string[]][]) {
    if (types.includes(file.type)) return bucket;
  }
  return null;
}

export interface UploadResult {
  url: string;
  path: string;
  bucket: StorageBucket;
  fileName: string;
}

export async function uploadToSupabase(
  file: File,
  bucket: StorageBucket,
  folder = ''
): Promise<UploadResult> {
  const ext = file.name.split('.').pop();
  const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const filePath = folder ? `${folder}/${uniqueName}` : uniqueName;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, { upsert: false, contentType: file.type });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);

  return { url: data.publicUrl, path: filePath, bucket, fileName: file.name };
}

export async function uploadAutoDetect(file: File, folder = ''): Promise<UploadResult> {
  const bucket = getBucketForFile(file);
  if (!bucket) {
    throw new Error(
      `Unsupported file type: ${file.type}. Supported: images, PDFs, videos, text files.`
    );
  }
  return uploadToSupabase(file, bucket, folder);
}

export async function deleteFromSupabase(bucket: StorageBucket, path: string): Promise<void> {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Delete failed: ${error.message}`);
}

// ─── Database types (Firebase/Firestore models) ───────────────────────────────

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?: string;
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
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  user_id: string;
  skill_name: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

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
  personal_details: string;
  education: string;
  skills: string;
  projects: string;
  experience: string;
  certifications: string;
  achievements: string;
  created_at: string;
  updated_at: string;
}

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

export interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'internship' | 'event' | 'course';
  item_id: string;
  saved_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'internship' | 'event' | 'application' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  user_id: string;
  review_type: 'internship' | 'course' | 'company';
  item_id: string;
  rating: number;
  content: string;
  created_at: string;
}

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

export interface AuthUser {
  id: string;
  email: string;
  created_at: string;
}
