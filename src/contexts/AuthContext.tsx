import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
interface FirebaseUser {
  uid: string;
  email: string;
}
type AppUser = User | FirebaseUser | null;
interface Session {
  user: AppUser;
}
import { Profile } from '../services/supabase';
import { loginUser, registerUser, logoutUser, onAuthStateChangedListener } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

useEffect(() => {
    const unsubscribe = onAuthStateChangedListener((firebaseUser) => {
      setUser(firebaseUser || null);
      if (firebaseUser) {
        fetchProfile(firebaseUser.uid);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });
    setLoading(false);
    return unsubscribe;
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, success } = await getCollection('profiles');
      if (success) {
        const profile = data.find((p: any) => p.id === userId);
        setProfile(profile || null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };


  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const result = await registerUser(email, password);
      if (result.success && result.user) {
        await addDocument('profiles', {
          id: result.user.uid,
          email,
          full_name: fullName,
        });
      }
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };


  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      return { error: result.success ? null : result.error as Error };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    return { error: new Error('Google Sign-In coming soon') };
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
    setSession(null);
    setProfile(null);
    navigate('/');
  };

  const updateProfile = async (data: Partial<Profile>) => {
    try {
      if (!user) throw new Error('No user logged in');
      await updateDocument('profiles', user.uid, data);
      setProfile((prev) => (prev ? { ...prev, ...data } : null));
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        loading,
        signUp,
        signIn,
        signInWithGoogle,
        signOut,
        updateProfile,
      }}
    >
      {children}
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
