import React, { createContext, useContext, useState, useEffect } from 'react';

export type PermissionKey =
  | 'users.view' | 'users.create' | 'users.edit' | 'users.delete' | 'users.block'
  | 'companies.view' | 'companies.verify' | 'companies.edit' | 'companies.block'
  | 'internships.view' | 'internships.create' | 'internships.edit' | 'internships.delete' | 'internships.publish'
  | 'events.view' | 'events.create' | 'events.edit' | 'events.delete'
  | 'courses.view' | 'courses.create' | 'courses.edit' | 'courses.delete'
  | 'content.view' | 'content.moderate' | 'content.delete'
  | 'analytics.view'
  | 'ai.use' | 'ai.configure'
  | 'notifications.send'
  | 'settings.view' | 'settings.edit'
  | 'backup.view' | 'backup.run'
  | 'roles.view' | 'roles.manage';

export const PERMISSION_GROUPS = [
  {
    label: 'User Management',
    color: 'blue',
    keys: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.block'] as PermissionKey[],
    descriptions: { 'users.view': 'View user list & profiles', 'users.create': 'Invite / create users', 'users.edit': 'Edit user data', 'users.delete': 'Delete user accounts', 'users.block': 'Block / unblock users' },
  },
  {
    label: 'Company Management',
    color: 'purple',
    keys: ['companies.view', 'companies.verify', 'companies.edit', 'companies.block'] as PermissionKey[],
    descriptions: { 'companies.view': 'View company list', 'companies.verify': 'Verify company accounts', 'companies.edit': 'Edit company data', 'companies.block': 'Block / unblock companies' },
  },
  {
    label: 'Internship Management',
    color: 'green',
    keys: ['internships.view', 'internships.create', 'internships.edit', 'internships.delete', 'internships.publish'] as PermissionKey[],
    descriptions: { 'internships.view': 'View listings', 'internships.create': 'Create new listings', 'internships.edit': 'Edit existing listings', 'internships.delete': 'Delete listings', 'internships.publish': 'Publish / unpublish' },
  },
  {
    label: 'Events',
    color: 'orange',
    keys: ['events.view', 'events.create', 'events.edit', 'events.delete'] as PermissionKey[],
    descriptions: { 'events.view': 'View events', 'events.create': 'Create events', 'events.edit': 'Edit events', 'events.delete': 'Delete events' },
  },
  {
    label: 'Courses',
    color: 'indigo',
    keys: ['courses.view', 'courses.create', 'courses.edit', 'courses.delete'] as PermissionKey[],
    descriptions: { 'courses.view': 'View courses', 'courses.create': 'Create courses', 'courses.edit': 'Edit courses', 'courses.delete': 'Delete courses' },
  },
  {
    label: 'Content Moderation',
    color: 'red',
    keys: ['content.view', 'content.moderate', 'content.delete'] as PermissionKey[],
    descriptions: { 'content.view': 'View flagged content', 'content.moderate': 'Moderate posts/comments', 'content.delete': 'Delete content permanently' },
  },
  {
    label: 'Analytics & AI',
    color: 'teal',
    keys: ['analytics.view', 'ai.use', 'ai.configure'] as PermissionKey[],
    descriptions: { 'analytics.view': 'View platform analytics', 'ai.use': 'Use AI tools', 'ai.configure': 'Configure AI models' },
  },
  {
    label: 'Platform Controls',
    color: 'gray',
    keys: ['notifications.send', 'settings.view', 'settings.edit', 'backup.view', 'backup.run', 'roles.view', 'roles.manage'] as PermissionKey[],
    descriptions: { 'notifications.send': 'Send platform notifications', 'settings.view': 'View settings', 'settings.edit': 'Edit settings', 'backup.view': 'View backup history', 'backup.run': 'Run manual backups', 'roles.view': 'View roles & permissions', 'roles.manage': 'Create/edit/delete roles' },
  },
];

const ALL_PERMISSIONS: PermissionKey[] = PERMISSION_GROUPS.flatMap(g => g.keys);

const SUPER_ADMIN_PERMISSIONS: PermissionKey[] = [...ALL_PERMISSIONS];

const ADMIN_PERMISSIONS: PermissionKey[] = ALL_PERMISSIONS.filter(p => p !== 'roles.manage');

const STAFF_DEFAULT_PERMISSIONS: PermissionKey[] = [
  'users.view',
  'companies.view',
  'internships.view',
  'events.view',
  'courses.view',
  'content.view', 'content.moderate',
  'analytics.view',
  'ai.use',
];

const MODERATOR_PERMISSIONS: PermissionKey[] = [
  'users.view', 'users.block',
  'content.view', 'content.moderate', 'content.delete',
  'internships.view', 'internships.publish',
];

export interface RoleDefinition {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: PermissionKey[];
  isSystem?: boolean;
}

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: 'super_admin',
    name: 'Super Admin',
    description: 'Full unrestricted access to all platform features and configuration.',
    color: 'red',
    permissions: SUPER_ADMIN_PERMISSIONS,
    isSystem: true,
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features except role management.',
    color: 'orange',
    permissions: ADMIN_PERMISSIONS,
    isSystem: true,
  },
  {
    id: 'staff',
    name: 'Staff',
    description: 'Standard staff permissions for day-to-day moderation and support.',
    color: 'emerald',
    permissions: STAFF_DEFAULT_PERMISSIONS,
    isSystem: false,
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: 'Content moderation only — can block users and delete harmful content.',
    color: 'yellow',
    permissions: MODERATOR_PERMISSIONS,
    isSystem: false,
  },
];

interface PermissionsContextType {
  roles: RoleDefinition[];
  hasPermission: (key: PermissionKey) => boolean;
  hasAnyPermission: (keys: PermissionKey[]) => boolean;
  getRoleById: (id: string) => RoleDefinition | undefined;
  createRole: (role: Omit<RoleDefinition, 'id'>) => void;
  updateRole: (id: string, updates: Partial<RoleDefinition>) => void;
  deleteRole: (id: string) => void;
  currentRoleId: string;
  setCurrentRoleId: (id: string) => void;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export const usePermissions = () => {
  const ctx = useContext(PermissionsContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionsProvider');
  return ctx;
};

const STORAGE_KEY = 'stunivoz_roles';

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roles, setRoles] = useState<RoleDefinition[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved) as RoleDefinition[];
    } catch {}
    return DEFAULT_ROLES;
  });

  const [currentRoleId, setCurrentRoleId] = useState<string>('super_admin');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(roles)); } catch {}
  }, [roles]);

  const getRoleById = (id: string) => roles.find(r => r.id === id);

  const hasPermission = (key: PermissionKey): boolean => {
    const role = getRoleById(currentRoleId);
    return role?.permissions.includes(key) ?? false;
  };

  const hasAnyPermission = (keys: PermissionKey[]): boolean => keys.some(hasPermission);

  const createRole = (role: Omit<RoleDefinition, 'id'>) => {
    const id = `role_${Date.now()}`;
    setRoles(prev => [...prev, { ...role, id }]);
  };

  const updateRole = (id: string, updates: Partial<RoleDefinition>) => {
    setRoles(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const deleteRole = (id: string) => {
    setRoles(prev => prev.filter(r => r.id !== id || r.isSystem));
  };

  return (
    <PermissionsContext.Provider value={{
      roles, hasPermission, hasAnyPermission, getRoleById,
      createRole, updateRole, deleteRole,
      currentRoleId, setCurrentRoleId,
    }}>
      {children}
    </PermissionsContext.Provider>
  );
};
