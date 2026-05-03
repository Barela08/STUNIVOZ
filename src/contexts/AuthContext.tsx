// @refresh reset
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  loginUser, registerUser, logoutUser, onAuthStateChangedListener,
  getDocument, setDocument, signInWithGoogle, signInWithGitHub
} from '../services/firebase';

export type UserRole = 'student' | 'company' | 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
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
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogleOAuth: () => Promise<{ error: any }>;
  signInWithGitHubOAuth: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  fetchProfile: (uid: string) => Promise<Profile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    try {
      const result = await getDocument('profiles', uid);
      if (result.success && result.data) {
        const p = result.data as Profile;
        setProfile(p);
        return p;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser: User | null) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result.success) return { error: null };
      return { error: result.error || new Error('Login failed') };
    } catch (err) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerUser(email, password);
      if (result.success && result.user) {
        const profileData: Profile = {
          id: result.user.uid,
          email,
          full_name: fullName,
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDocument('profiles', result.user.uid, profileData);
        setProfile(profileData);
        return { error: null };
      }
      return { error: result.error || new Error('Registration failed') };
    } catch (err) {
      return { error: err };
    }
  };

  // Google OAuth — students only
  const signInWithGoogleOAuth = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const firebaseUser = userCredential.user;

      const result = await getDocument('profiles', firebaseUser.uid);
      if (!result.success || !result.data) {
        const profileData: Profile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || '',
          profile_photo: firebaseUser.photoURL || '',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDocument('profiles', firebaseUser.uid, profileData);
        setProfile(profileData);
      } else {
        const existingProfile = result.data as Profile;
        // Block non-students from using Google OAuth
        if (existingProfile.role && existingProfile.role !== 'student') {
          await auth.signOut();
          return { error: { message: 'Google login is only available for students. Please use your portal login page.' } };
        }
        setProfile(existingProfile);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  // GitHub OAuth — students only
  const signInWithGitHubOAuth = async () => {
    try {
      const userCredential = await signInWithGitHub();
      const firebaseUser = userCredential.user;

      const result = await getDocument('profiles', firebaseUser.uid);
      if (!result.success || !result.data) {
        const profileData: Profile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || '',
          profile_photo: firebaseUser.photoURL || '',
          role: 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDocument('profiles', firebaseUser.uid, profileData);
        setProfile(profileData);
      } else {
        const existingProfile = result.data as Profile;
        // Block non-students from using GitHub OAuth
        if (existingProfile.role && existingProfile.role !== 'student') {
          await auth.signOut();
          return { error: { message: 'GitHub login is only available for students. Please use your portal login page.' } };
        }
        setProfile(existingProfile);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };
    try {
      const result = await setDocument('profiles', user.uid, {
        ...data,
        id: user.uid,
        updated_at: new Date().toISOString(),
      });
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...data } : { id: user.uid, email: user.email || '', full_name: '', ...data });
        return { error: null };
      }
      return { error: result.error || new Error('Update failed') };
    } catch (err) {
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading,
      signIn, signUp,
      signInWithGoogleOAuth,
      signInWithGitHubOAuth,
      signOut, updateProfile, fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
