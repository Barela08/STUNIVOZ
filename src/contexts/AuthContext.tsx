import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  loginUser,
  loginWithGithub,
  loginWithGoogle,
  registerUser,
  logoutUser,
  onAuthStateChangedListener,
  getCollection,
  addDocument,
  updateDocument
} from '../services/firebase';
import type { UserRole } from '../types/firebase';

// Local Profile type (Firebase)
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  profile_photo?: string;
  phone?: string;
  role: 'student' | 'provider' | 'staff' | 'admin';
  headline?: string;
  location?: string;
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
  company_name?: string;
  company_domain?: string;
  is_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<AuthResult>;
  register: (email: string, pass: string, name: string, role?: UserRole, profileData?: Partial<Profile>) => Promise<AuthResult>;
  logout: () => Promise<void>;
  signIn: (email: string, pass: string) => Promise<AuthResult>;
  signInWithGoogle: () => Promise<AuthResult>;
  signInWithGithub: () => Promise<AuthResult>;
  signUp: (email: string, pass: string, name: string, role?: UserRole, profileData?: Partial<Profile>) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

type AuthResult = {
  error: Error | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toError = (error: unknown): Error =>
  error instanceof Error ? error : new Error('Something went wrong. Please try again.');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch profile
        try {
          const result = await getCollection('profiles');
          if (result.success && result.data) {
            const myProfile = result.data.find((p) => p.id === firebaseUser.uid);
            if (myProfile) {
              setProfile(myProfile as Profile);
            }
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string): Promise<AuthResult> => {
    const result = await loginUser(email, pass);
    return { error: result.success ? null : toError(result.error) };
  };

  const signInWithProvider = async (
    providerLogin: typeof loginWithGoogle | typeof loginWithGithub
  ): Promise<AuthResult> => {
    const result = await providerLogin();
    if (!result.success || !result.user) {
      return { error: toError(result.error) };
    }

    const profiles = await getCollection('profiles');
    const existingProfile = profiles.success
      ? profiles.data?.find((p) => p.id === result.user.uid)
      : undefined;

    if (!existingProfile) {
      const newProfile: Profile = {
        id: result.user.uid,
        email: result.user.email || '',
        full_name: result.user.displayName || 'User',
        profile_photo: result.user.photoURL || undefined,
        role: 'student'
      };
      const profileResult = await addDocument('profiles', newProfile);
      if (!profileResult.success) {
        return { error: toError(profileResult.error) };
      }
      setProfile(newProfile);
    }

    return { error: null };
  };

  const signInWithGoogle = () => signInWithProvider(loginWithGoogle);

  const signInWithGithub = () => signInWithProvider(loginWithGithub);

  const register = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole = 'student',
    profileData: Partial<Profile> = {}
  ): Promise<AuthResult> => {
    const result = await registerUser(email, pass);
    if (!result.success || !result.user) {
      return { error: toError(result.error) };
    }

    const newProfile: Profile = {
      id: result.user.uid,
      email: result.user.email || email,
      full_name: name,
      role,
      ...profileData
    };
    const profileResult = await addDocument('profiles', newProfile);
    if (!profileResult.success) {
      return { error: toError(profileResult.error) };
    }
    setProfile(newProfile);
    return { error: null };
  };

  const logout = async () => {
    await logoutUser();
  };

  const updateProfile = async (data: Partial<Profile>) => {
    if (!profile) return;
    try {
      const updatedProfile = { ...profile, ...data };
      await updateDocument('profiles', profile.id, updatedProfile);
      setProfile(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        login,
        register,
        logout,
        signIn: login,
        signInWithGoogle,
        signInWithGithub,
        signUp: register,
        signOut: logout,
        updateProfile
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
