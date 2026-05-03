export interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?: string;
  location?: string;
  bio?: string;
  college?: string;
  degree?: string;
  graduation_year?: string;
  skills?: string[];
  github?: string;
  linkedin?: string;
  portfolio?: string;
  role?: string;
  createdAt?: string;
}
