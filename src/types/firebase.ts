export type UserRole = 'student' | 'provider' | 'staff' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?: string;
  role: UserRole;
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
  created_at?: string;
  updated_at?: string;
}
