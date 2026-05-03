import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Check, Users, AlertTriangle } from 'lucide-react';
import { usePermissions, PERMISSION_GROUPS, type RoleDefinition, type PermissionKey } from '../../contexts/PermissionsContext';
import { Card } from '../../components/common';

const COLOR_OPTIONS = [
  { id: 'red', label: 'Red', bg: 'bg-red-500', text: 'text-red-600', light: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
  { id: 'orange', label: 'Orange', bg: 'bg-orange-500', text: 'text-orange-600', light: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
  { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' },
  { id: 'yellow', label: 'Yellow', bg: 'bg-yellow-500', text: 'text-yellow-600', light: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
  { id: 'blue', label: 'Blue', bg: 'bg-blue-500', text: 'text-blue-600', light: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
  { id: 'purple', label: 'Purple', bg: 'bg-purple-500', text: 'text-purple-600', light: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' },
  { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500', text: 'text-indigo-600', light: 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800' },
  { id: 'gray', label: 'Gray', bg: 'bg-gray-500', text: 'text-gray-600', light: 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800' },
];

const getColor = (colorId: string) => COLOR_OPTIONS.find(c => c.id === colorId) || COLOR_OPTIONS[7];

const groupColorMap: Record<string, string> = {
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
  green: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  orange: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
  indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20',
  red: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
  teal: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20',
  gray: 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800',
};

interface RoleEditorProps {
  role?: RoleDefinition;
  onSave: (data: Omit<RoleDefinition, 'id'>) => void;
  onCancel: () => void;
}

const RoleEditor: React.FC<RoleEditorProps> = ({ role, onSave, onCancel }) => {
  const [name, setName] = useState(role?.name || '');
  const [description, setDescription] = useState(role?.description || '');
  const [color, setColor] = useState(role?.color || 'blue');
  const [permissions, setPermissions] = useState<Set<PermissionKey>>(
    new Set(role?.permissions || [])
  );
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(PERMISSION_GROUPS.map(g => g.label))
  );

  const toggleGroup = (label: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const togglePerm = (key: PermissionKey) => {
    setPermissions(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleGroupAll = (keys: PermissionKey[], checked: boolean) => {
    setPermissions(prev => {
      const next = new Set(prev);
      keys.forEach(k => checked ? next.add(k) : next.delete(k));
      return next;
    });
  };

  const totalPerms = PERMISSION_GROUPS.flatMap(g => g.keys).length;

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), color, permissions: [...permissions], isSystem: role?.isSystem });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl my-6 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {role ? `Edit Role: ${role.name}` : 'Create New Role'}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {permissions.size} of {totalPerms} permissions enabled
            </p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Content Moderator"
                disabled={role?.isSystem}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color</label>
              <div className="flex gap-2 flex-wrap mt-1">
                {COLOR_OPTIONS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setColor(c.id)}
                    className={`w-7 h-7 rounded-full ${c.bg} transition-all ${color === c.id ? 'ring-2 ring-offset-2 ring-gray-400 dark:ring-offset-gray-900 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Brief description of this role's responsibilities"
              className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-red-500 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Permissions</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPermissions(new Set(PERMISSION_GROUPS.flatMap(g => g.keys)))}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Select All
                </button>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <button
                  onClick={() => setPermissions(new Set())}
                  className="text-xs text-red-500 hover:underline font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {PERMISSION_GROUPS.map(group => {
                const groupChecked = group.keys.filter(k => permissions.has(k)).length;
                const allChecked = groupChecked === group.keys.length;
                const isExpanded = expandedGroups.has(group.label);

                return (
                  <div key={group.label} className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleGroup(group.label)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={e => { e.stopPropagation(); toggleGroupAll(group.keys, e.target.checked); }}
                          onClick={e => e.stopPropagation()}
                          className="w-4 h-4 rounded accent-red-600 cursor-pointer"
                        />
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{group.label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${groupColorMap[group.color] || groupColorMap.gray}`}>
                          {groupChecked}/{group.keys.length}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                    </button>

                    {isExpanded && (
                      <div className="px-4 py-3 space-y-2 bg-white dark:bg-gray-900">
                        {group.keys.map(key => (
                          <label key={key} className="flex items-center gap-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={permissions.has(key)}
                              onChange={() => togglePerm(key)}
                              className="w-4 h-4 rounded accent-red-600 cursor-pointer"
                            />
                            <div>
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                {key.split('.')[1].charAt(0).toUpperCase() + key.split('.')[1].slice(1)}
                              </span>
                              <span className="text-xs text-gray-400 ml-2">
                                {group.descriptions[key as keyof typeof group.descriptions]}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-500/20"
          >
            <Save className="w-4 h-4" />
            {role ? 'Save Changes' : 'Create Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface AssignRoleModalProps {
  userName: string;
  currentRoleId: string;
  onAssign: (roleId: string) => void;
  onCancel: () => void;
}

export const AssignRoleModal: React.FC<AssignRoleModalProps> = ({ userName, currentRoleId, onAssign, onCancel }) => {
  const { roles } = usePermissions();
  const [selected, setSelected] = useState(currentRoleId);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Assign Role</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{userName}</p>
          </div>
          <button onClick={onCancel} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-2">
          {roles.map(role => {
            const col = getColor(role.color);
            const permCount = role.permissions.length;
            return (
              <button
                key={role.id}
                onClick={() => setSelected(role.id)}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${selected === role.id ? `border-red-500 bg-red-50 dark:bg-red-900/20` : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 bg-white dark:bg-gray-800/30'}`}
              >
                <div className={`w-3 h-3 rounded-full ${col.bg} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{role.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{role.description}</p>
                </div>
                <span className="text-xs text-gray-400">{permCount} perms</span>
                {selected === role.id && <Check className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
        <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-gray-800">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
            Cancel
          </button>
          <button
            onClick={() => onAssign(selected)}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all shadow-lg shadow-red-500/20"
          >
            Assign Role
          </button>
        </div>
      </div>
    </div>
  );
};

export const RolesPage: React.FC = () => {
  const { roles, createRole, updateRole, deleteRole } = usePermissions();
  const [editingRole, setEditingRole] = useState<RoleDefinition | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const handleSaveNew = (data: Omit<RoleDefinition, 'id'>) => {
    createRole(data);
    setIsCreating(false);
    setSaved('new');
    setTimeout(() => setSaved(null), 3000);
  };

  const handleSaveEdit = (data: Omit<RoleDefinition, 'id'>) => {
    if (!editingRole) return;
    updateRole(editingRole.id, data);
    setEditingRole(null);
    setSaved(editingRole.id);
    setTimeout(() => setSaved(null), 3000);
  };

  const handleDelete = (id: string) => {
    deleteRole(id);
    setDeleteConfirm(null);
  };

  const totalPerms = PERMISSION_GROUPS.flatMap(g => g.keys).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {(isCreating || editingRole) && (
        <RoleEditor
          role={editingRole || undefined}
          onSave={editingRole ? handleSaveEdit : handleSaveNew}
          onCancel={() => { setIsCreating(false); setEditingRole(null); }}
        />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Delete Role?</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
              Users currently assigned this role will lose their permissions. Make sure to reassign them first.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm transition-all">
                Delete Role
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-0.5 text-sm">
            Define roles with granular permission controls. Assign them to staff and admin users.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-red-600 rounded-xl hover:bg-red-700 transition-all shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" /> Create Role
        </button>
      </div>

      {saved && (
        <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <Check className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-400 font-semibold">Role saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Roles', value: roles.length, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'System Roles', value: roles.filter(r => r.isSystem).length, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Custom Roles', value: roles.filter(r => !r.isSystem).length, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Total Permissions', value: totalPerms, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
        ].map((s, i) => (
          <Card key={i} className="!p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <Shield className={`w-5 h-5 ${s.color}`} />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {roles.map(role => {
          const col = getColor(role.color);
          const permCount = role.permissions.length;
          const isExpanded = expandedRole === role.id;

          return (
            <Card key={role.id} className={`!p-0 overflow-hidden border-l-4 border-l-${role.color}-500`}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-10 h-10 rounded-xl ${col.bg} flex items-center justify-center flex-shrink-0`}>
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-gray-900 dark:text-white">{role.name}</h3>
                        {role.isSystem && (
                          <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full font-medium">System</span>
                        )}
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${col.light} border`}>
                          {permCount}/{totalPerms} permissions
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 truncate">{role.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => setExpandedRole(isExpanded ? null : role.id)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-all"
                      title="View permissions"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setEditingRole(role)}
                      className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-blue-600 transition-all"
                      title="Edit role"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {!role.isSystem && (
                      <button
                        onClick={() => setDeleteConfirm(role.id)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 transition-all"
                        title="Delete role"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Permission coverage</span>
                    <span>{Math.round((permCount / totalPerms) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${col.bg} transition-all duration-500`}
                      style={{ width: `${(permCount / totalPerms) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 dark:border-gray-800 p-5 bg-gray-50/50 dark:bg-gray-800/30">
                  <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Permission Breakdown</h4>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {PERMISSION_GROUPS.map(group => {
                      const enabled = group.keys.filter(k => role.permissions.includes(k));
                      const gColor = groupColorMap[group.color] || groupColorMap.gray;
                      return (
                        <div key={group.label} className="bg-white dark:bg-gray-900 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${gColor}`}>{group.label}</span>
                            <span className="text-xs text-gray-400">{enabled.length}/{group.keys.length}</span>
                          </div>
                          <div className="space-y-1">
                            {group.keys.map(key => {
                              const isEnabled = role.permissions.includes(key);
                              return (
                                <div key={key} className={`flex items-center gap-2 text-xs ${isEnabled ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                  {group.descriptions[key as keyof typeof group.descriptions]}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="p-5">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-gray-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">Permission Schema (JSON)</h3>
          </div>
          <div className="bg-gray-900 dark:bg-gray-950 rounded-xl p-4 overflow-x-auto">
            <pre className="text-xs text-green-400 font-mono leading-relaxed">
              {JSON.stringify({
                roles: roles.map(r => ({
                  id: r.id,
                  name: r.name,
                  permissions: r.permissions,
                }))
              }, null, 2)}
            </pre>
          </div>
        </div>
      </Card>
    </div>
  );
};
