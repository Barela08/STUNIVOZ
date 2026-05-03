// @refresh reset
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../services/firebase';
import { loginUser, registerUser, logoutUser, onAuthStateChangedListener, getDocument, setDocument } from '../services/firebase';

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

  const fetchProfile = async (uid: string) => {
    try {
      const result = await getDocument('profiles', uid);
      if (result.success && result.data) {
        setProfile(result.data as Profile);
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
        await fetchProfile(firebaseUser.uid);
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
        const profileData: Profile = {
          id: result.user.uid,
          email,
          full_name: fullName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        // Use setDocument so the doc ID matches the user UID
        await setDocument('profiles', result.user.uid, profileData);
        setProfile(profileData);
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

      // Check if profile already exists
      const result = await getDocument('profiles', firebaseUser.uid);
      if (!result.success || !result.data) {
        const profileData: Profile = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          full_name: firebaseUser.displayName || '',
          profile_photo: firebaseUser.photoURL || '',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        await setDocument('profiles', firebaseUser.uid, profileData);
        setProfile(profileData);
      } else {
        setProfile(result.data as Profile);
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
      // setDocument with merge:true works even if the doc doesn't exist yet
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
