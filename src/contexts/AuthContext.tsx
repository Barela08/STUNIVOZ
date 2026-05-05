// @refresh reset
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, OAuthCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import {
  loginUser, registerUser, logoutUser, onAuthStateChangedListener,
  getDocument, setDocument, signInWithGoogle, signInWithGitHub,
  getSignInMethodsForEmail, getCredentialFromError, linkPendingCredential,
  incrementLoginCount
} from '../services/firebase';

export type UserRole = 'student' | 'company' | 'admin' | 'staff';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  role?: UserRole;
  profile_photo?: string;
  provider?: string;
  last_login?: string;
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

export interface PendingLinkInfo {
  email: string;
  methods: string[];
  provider: 'google' | 'github';
}

const ADMIN_SESSION_KEY = 'stunivoz_admin_session';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  pendingLinkInfo: PendingLinkInfo | null;
  clearPendingLink: () => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signInWithGoogleOAuth: () => Promise<{ error: any }>;
  signInWithGitHubOAuth: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: any }>;
  fetchProfile: (uid: string) => Promise<Profile | null>;
  adminCredentialSignIn: (role: UserRole, email: string) => void;
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
  const [pendingLinkInfo, setPendingLinkInfo] = useState<PendingLinkInfo | null>(null);
  const pendingCredRef = useRef<OAuthCredential | null>(null);

  const clearPendingLink = () => {
    setPendingLinkInfo(null);
    pendingCredRef.current = null;
  };

  const fetchProfile = async (uid: string): Promise<Profile | null> => {
    try {
      const [profilesResult, usersResult] = await Promise.all([
        getDocument('profiles', uid),
        getDocument('users', uid),
      ]);

      const found =
        (profilesResult.success && profilesResult.data ? profilesResult.data as Profile : null) ||
        (usersResult.success && usersResult.data ? usersResult.data as Profile : null);

      if (found) {
        setProfile(found);
        return found;
      }
      return null;
    } catch (err) {
      console.error('Error fetching profile:', err);
      return null;
    }
  };

  useEffect(() => {
    const SESSION_MAX_AGE_MS = 8 * 60 * 60 * 1000; // 8 hours
    const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
    if (savedSession) {
      try {
        const parsed = JSON.parse(savedSession) as Profile & { _savedAt?: number };
        const savedAt = parsed._savedAt || 0;
        const isExpired = Date.now() - savedAt > SESSION_MAX_AGE_MS;
        if (isExpired) {
          localStorage.removeItem(ADMIN_SESSION_KEY);
        } else if (parsed.role === 'admin') {
          setProfile(parsed);
          setLoading(false);
        }
      } catch {
        localStorage.removeItem(ADMIN_SESSION_KEY);
      }
    }

    const timeout = setTimeout(() => setLoading(false), 5000);
    const unsubscribe = onAuthStateChangedListener(async (firebaseUser: User | null) => {
      clearTimeout(timeout);
      setUser(firebaseUser);
      if (firebaseUser) {
        const p = await fetchProfile(firebaseUser.uid);
        if (p) {
          if (p.role === 'admin') {
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify({ ...p, _savedAt: Date.now() }));
          }
        }
      } else {
        const savedSession = localStorage.getItem(ADMIN_SESSION_KEY);
        if (!savedSession) {
          setProfile(null);
        }
      }
      setLoading(false);
    });
    return () => { clearTimeout(timeout); unsubscribe(); };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await loginUser(email, password);
      if (result.success && result.user) {
        const now = new Date().toISOString();
        const existing = await fetchProfile(result.user.uid);
        await setDocument('profiles', result.user.uid, {
          id: result.user.uid,
          email,
          full_name: existing?.full_name || email.split('@')[0],
          role: existing?.role || 'student',
          provider: existing?.provider || 'email',
          last_login: now,
          updated_at: now,
          ...(existing ? {} : { created_at: now }),
        });

        await incrementLoginCount(result.user.uid);

        if (pendingCredRef.current) {
          try {
            await linkPendingCredential(pendingCredRef.current);
            const linkedProvider = pendingLinkInfo?.provider || 'google';
            await setDocument('profiles', result.user.uid, {
              provider: `${existing?.provider || 'email'},${linkedProvider}`,
              updated_at: new Date().toISOString(),
            });
          } catch (linkErr) {
            console.warn('Auto-link failed:', linkErr);
          } finally {
            clearPendingLink();
          }
        }

        return { error: null };
      }
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
          provider: 'email',
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

  const signInWithGoogleOAuth = async () => {
    try {
      const userCredential = await signInWithGoogle();
      const firebaseUser = userCredential.user;
      const now = new Date().toISOString();

      const existing = await fetchProfile(firebaseUser.uid);
      if (existing && existing.role && existing.role !== 'student') {
        await auth.signOut();
        return { error: { message: 'Google login is only available for students. Please use your portal login page.' } };
      }

      const profileData: Profile = {
        ...(existing || {}),
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: firebaseUser.displayName || existing?.full_name || '',
        profile_photo: firebaseUser.photoURL || existing?.profile_photo || '',
        role: existing?.role || 'student',
        provider: 'google',
        last_login: now,
        updated_at: now,
        ...(!existing ? { created_at: now } : {}),
      };
      await setDocument('profiles', firebaseUser.uid, profileData);
      await incrementLoginCount(firebaseUser.uid);
      setProfile(profileData);
      clearPendingLink();
      return { error: null };
    } catch (err: any) {
      if (err?.code === 'auth/account-exists-with-different-credential') {
        const email = err?.customData?.email || '';
        const pendingCred = getCredentialFromError(err, 'google');
        let methods: string[] = [];
        try {
          if (email) methods = await getSignInMethodsForEmail(email);
        } catch {}
        if (pendingCred) pendingCredRef.current = pendingCred;
        const linkInfo: PendingLinkInfo = { email, methods, provider: 'google' };
        setPendingLinkInfo(linkInfo);
        return {
          error: {
            code: 'auth/account-link-required',
            email,
            methods,
            provider: 'google',
            message: 'account-link-required',
          }
        };
      }
      return { error: err };
    }
  };

  const signInWithGitHubOAuth = async () => {
    try {
      const userCredential = await signInWithGitHub();
      const firebaseUser = userCredential.user;
      const now = new Date().toISOString();

      const existing = await fetchProfile(firebaseUser.uid);
      if (existing && existing.role && existing.role !== 'student') {
        await auth.signOut();
        return { error: { message: 'GitHub login is only available for students. Please use your portal login page.' } };
      }

      const profileData: Profile = {
        ...(existing || {}),
        id: firebaseUser.uid,
        email: firebaseUser.email || '',
        full_name: firebaseUser.displayName || existing?.full_name || firebaseUser.email?.split('@')[0] || '',
        profile_photo: firebaseUser.photoURL || existing?.profile_photo || '',
        role: existing?.role || 'student',
        provider: 'github',
        last_login: now,
        updated_at: now,
        ...(!existing ? { created_at: now } : {}),
      };
      await setDocument('profiles', firebaseUser.uid, profileData);
      await incrementLoginCount(firebaseUser.uid);
      setProfile(profileData);
      clearPendingLink();
      return { error: null };
    } catch (err: any) {
      if (err?.code === 'auth/account-exists-with-different-credential') {
        const email = err?.customData?.email || '';
        const pendingCred = getCredentialFromError(err, 'github');
        let methods: string[] = [];
        try {
          if (email) methods = await getSignInMethodsForEmail(email);
        } catch {}
        if (pendingCred) pendingCredRef.current = pendingCred;
        const linkInfo: PendingLinkInfo = { email, methods, provider: 'github' };
        setPendingLinkInfo(linkInfo);
        return {
          error: {
            code: 'auth/account-link-required',
            email,
            methods,
            provider: 'github',
            message: 'account-link-required',
          }
        };
      }
      return { error: err };
    }
  };

  const signOut = async () => {
    await logoutUser();
    localStorage.removeItem(ADMIN_SESSION_KEY);
    clearPendingLink();
    setUser(null);
    setProfile(null);
  };

  const adminCredentialSignIn = (role: UserRole, email: string) => {
    const mockProfile: Profile = {
      id: `admin-${role}-001`,
      email,
      full_name: role === 'admin' ? 'STUNIVOZ Admin' : role === 'staff' ? 'STUNIVOZ Staff' : 'Company User',
      role,
      headline: role === 'admin' ? 'Platform Administrator' : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setProfile(mockProfile);
    localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(mockProfile));
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
      pendingLinkInfo, clearPendingLink,
      signIn, signUp,
      signInWithGoogleOAuth,
      signInWithGitHubOAuth,
      signOut, updateProfile, fetchProfile, adminCredentialSignIn
    }}>
      {children}
    </AuthContext.Provider>
  );
};
