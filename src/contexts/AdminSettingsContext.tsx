import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface FeatureFlag {
  key: string;
  label: string;
  description: string;
  category: string;
  enabled: boolean;
}

interface AdminSettings {
  maintenanceMode: boolean;
  maintenanceMessage: string;
  features: FeatureFlag[];
  activeTheme: string;
}

interface AdminSettingsContextType extends AdminSettings {
  setMaintenanceMode: (on: boolean) => void;
  setMaintenanceMessage: (msg: string) => void;
  toggleFeature: (key: string) => void;
  setFeatures: (features: FeatureFlag[]) => void;
  addFeature: (f: FeatureFlag) => void;
  setActiveTheme: (theme: string) => void;
  isFeatureEnabled: (key: string) => boolean;
}

const STORAGE_KEY = 'stunivoz_admin_settings';

const DEFAULT_FEATURES: FeatureFlag[] = [
  { key: 'community', label: 'Community Feed', description: 'Social feed for students', category: 'Social', enabled: true },
  { key: 'gamification', label: 'Gamification', description: 'Points, badges, and leaderboard', category: 'Engagement', enabled: true },
  { key: 'ats', label: 'ATS Analyzer', description: 'AI resume analysis tool', category: 'AI', enabled: true },
  { key: 'ai_recommend', label: 'AI Recommendations', description: 'Personalised internship suggestions', category: 'AI', enabled: false },
  { key: 'ai_interview', label: 'AI Mock Interview', description: 'AI-powered interview simulator', category: 'AI', enabled: false },
  { key: 'ai_chatbot', label: 'Career Chatbot', description: 'AI career guidance assistant', category: 'AI', enabled: true },
  { key: 'qna', label: 'Q&A Forum', description: 'Student question & answer board', category: 'Social', enabled: true },
  { key: 'planner', label: 'Career Planner', description: 'Goal-setting and roadmap tool', category: 'Tools', enabled: true },
  { key: 'content_hub', label: 'Content Hub', description: 'Blogs, tips, and resource articles', category: 'Content', enabled: false },
  { key: 'referral', label: 'Referral System', description: 'User referral and rewards', category: 'Engagement', enabled: false },
  { key: 'multilang', label: 'Multilingual', description: 'Hindi, Tamil, Telugu language support', category: 'Tools', enabled: false },
  { key: 'reviews', label: 'Company Reviews', description: 'Student reviews for companies', category: 'Content', enabled: true },
];

const DEFAULT_SETTINGS: AdminSettings = {
  maintenanceMode: false,
  maintenanceMessage: "We are undergoing scheduled maintenance. We'll be back in 30 minutes.",
  features: DEFAULT_FEATURES,
  activeTheme: 'default',
};

function loadSettings(): AdminSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<AdminSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      features: parsed.features && parsed.features.length > 0 ? parsed.features : DEFAULT_FEATURES,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: AdminSettings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: JSON.stringify(settings) }));
  } catch {}
}

const AdminSettingsContext = createContext<AdminSettingsContextType | null>(null);

export const AdminSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AdminSettings>(loadSettings);

  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue) as AdminSettings;
          setSettings(parsed);
        } catch {}
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const update = useCallback((patch: Partial<AdminSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch };
      saveSettings(next);
      return next;
    });
  }, []);

  const setMaintenanceMode = (on: boolean) => update({ maintenanceMode: on });
  const setMaintenanceMessage = (msg: string) => update({ maintenanceMessage: msg });
  const setActiveTheme = (theme: string) => update({ activeTheme: theme });

  const setFeatures = (features: FeatureFlag[]) => update({ features });

  const toggleFeature = (key: string) => {
    setSettings(prev => {
      const next = {
        ...prev,
        features: prev.features.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f),
      };
      saveSettings(next);
      return next;
    });
  };

  const addFeature = (f: FeatureFlag) => {
    setSettings(prev => {
      const next = { ...prev, features: [...prev.features, f] };
      saveSettings(next);
      return next;
    });
  };

  const isFeatureEnabled = (key: string) => {
    const f = settings.features.find(feat => feat.key === key);
    return f ? f.enabled : true;
  };

  return (
    <AdminSettingsContext.Provider value={{
      ...settings,
      setMaintenanceMode,
      setMaintenanceMessage,
      toggleFeature,
      setFeatures,
      addFeature,
      setActiveTheme,
      isFeatureEnabled,
    }}>
      {children}
    </AdminSettingsContext.Provider>
  );
};

export const useAdminSettings = () => {
  const ctx = useContext(AdminSettingsContext);
  if (!ctx) throw new Error('useAdminSettings must be inside AdminSettingsProvider');
  return ctx;
};
