import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginUser, registerUser, logoutUser, onAuthStateChangedListener, getCollection, addDocument, updateDocument } from '../services/firebase';

interface Profile {
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
  created_at?: string;
  updated_at?: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
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

  const fetchProfile = async (uid: string, email: string) => {
    try {
      const result = await getCollection('profiles');
      if (result.success && result.data) {
        const userProfile = (result.data as any[]).find((p: any) => p.id === uid || p.user_id === uid);
        if (userProfile) {
          setProfile(userProfile as Profile);
        }
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    }
  };

  useEffect(() => {
    // Safety timeout — if Firebase never responds, stop showing loading screen
    const timeout = setTimeout(() => setLoading(false), 5000);

    const unsubscribe = onAuthStateChangedListener(async (firebaseUser: User | null) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProfile(firebaseUser.uid, firebaseUser.email || '');
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result.success) {
        return { error: null };
      }
      return { error: result.error || new Error('Login failed') };
    } catch (err) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerUser(email, password);
      if (result.success && result.user) {
        const profileData: Omit<Profile, 'id'> = {
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await addDocument('profiles', { ...profileData, user_id: result.user.uid, id: result.user.uid });
        setProfile({ id: result.user.uid, ...profileData });
        return { error: null };
      }
      return { error: result.error || new Error('Registration failed') };
    } catch (err) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      const result = await getCollection('profiles');
      const existingProfile = result.success && result.data
        ? (result.data as any[]).find((p: any) => p.id === firebaseUser.uid || p.user_id === firebaseUser.uid)
        : null;

      if (!existingProfile) {
        const profileData = {
          id: firebaseUser.uid,
          user_id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || '',
          profile_photo: firebaseUser.photoURL || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await addDocument('profiles', profileData);
        setProfile(profileData as Profile);
      } else {
        setProfile(existingProfile as Profile);
      }

      return { error: null };
    } catch (err) {
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
      const result = await updateDocument('profiles', user.uid, {
        ...data,
        updated_at: new Date().toISOString(),
      });
      if (result.success) {
        setProfile(prev => prev ? { ...prev, ...data } : null);
        return { error: null };
      }
      return { error: result.error || new Error('Update failed') };
    } catch (err) {
      return { error: err };
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
