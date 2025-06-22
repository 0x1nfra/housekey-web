import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, 
  Users, 
  Plus, 
  Mail, 
  Trash2, 
  Crown, 
  Shield, 
  User,
  X,
  Copy,
  Check,
  AlertTriangle
} from 'lucide-react';
import { useHubStore } from '../../store/hubStore';
import { HubRole, InviteMemberData, CreateHubData } from '../../types/hub';

interface HubSettingsProps {
  activeTab?: string;
  action?: string;
}

const HubSettings: React.FC<HubSettingsProps> = ({ activeTab = 'general', action }) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [showCreateModal, setShowCreateModal] = useState(action === 'create');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);

  const {
    currentHub,
    userHubs,
    hubMembers,
    pendingInvites,
    loading,
    error,
    createHub,
    updateHub,
    deleteHub,
    inviteMember,
    removeMember,
    updateMemberRole,
    cancelInvitation,
    getHubPermissions,
    clearError
  } = useHubStore();

  const permissions = getHubPermissions();

  useEffect(() => {
    if (action === 'create') {
      setShowCreateModal(true);
    }
  }, [action]);

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'members', label: 'Members', icon: Users },
  ];

  const roleIcons = {
    owner: Crown,
    manager: Shield,
    member: User
  };

  const roleColors = {
    owner: 'text-amber-600 bg-amber-100',
    manager: 'text-indigo-600 bg-indigo-100',
    member: 'text-gray-600 bg-gray-100'
  };

  const handleCreateHub = async (data: CreateHubData) => {
    const result = await createHub(data);
    if (result.success) {
      setShowCreateModal(false);
    }
  };

  const handleInviteMember = async (data: InviteMemberData) => {
    if (!currentHub) return;
    
    const result = await inviteMember(currentHub.id, data);
    if (result.success) {
      setShowInviteModal(false);
    }
  };

  const handleDeleteHub = async () => {
    if (!currentHub) return;
    
    const result = await deleteHub(currentHub.id);
    if (result.success) {
      setShowDeleteModal(false);
    }
  };

  const copyInviteLink = async (inviteId: string) => {
    const inviteLink = `${window.location.origin}/invite/${inviteId}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(inviteId);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  if (!currentHub) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings size={24} className="text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Hub Selected</h3>
        <p className="text-gray-500 mb-6">Create or select a hub to manage settings</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Your First Hub
        </motion.button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                currentTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {currentTab === 'general' && (
          <motion.div
            key="general"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Hub Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hub Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Hub Name
                  </label>
                  <input
                    type="text"
                    defaultValue={currentHub.name}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!permissions.canManageHub}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Description
                  </label>
                  <textarea
                    defaultValue={currentHub.description || ''}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Describe your family hub..."
                    disabled={!permissions.canManageHub}
                  />
                </div>

                {permissions.canManageHub && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Hub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{hubMembers.length}</p>
                    <p className="text-sm text-gray-500">Members</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Mail size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{pendingInvites.length}</p>
                    <p className="text-sm text-gray-500">Pending Invites</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <Settings size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Created</p>
                    <p className="text-sm text-gray-500">
                      {new Date(currentHub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            {permissions.canDeleteHub && (
              <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
                <h3 className="text-lg font-semibold text-red-900 mb-4">Danger Zone</h3>
                
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <h4 className="font-medium text-red-900">Delete Hub</h4>
                    <p className="text-sm text-red-700">
                      Permanently delete this hub and all its data. This cannot be undone.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Delete Hub
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {currentTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Members Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hub Members</h3>
                <p className="text-sm text-gray-500">
                  Manage who has access to your family hub
                </p>
              </div>
              
              {permissions.canInviteMembers && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowInviteModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Invite Member
                </motion.button>
              )}
            </div>

            {/* Current Members */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h4 className="font-medium text-gray-900">Current Members ({hubMembers.length})</h4>
              </div>

              <div className="divide-y divide-gray-100">
                {hubMembers.map(member => {
                  const RoleIcon = roleIcons[member.role];
                  
                  return (
                    <div key={member.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-lg">
                            {member.user_profile?.name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">
                            {member.user_profile?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {member.user_profile?.email}
                          </p>
                          <p className="text-xs text-gray-400">
                            Joined {new Date(member.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${roleColors[member.role]}`}>
                          <RoleIcon size={14} />
                          <span className="capitalize">{member.role}</span>
                        </div>

                        {permissions.canRemoveMembers && member.role !== 'owner' && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeMember(member.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove member"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pending Invitations */}
            {pendingInvites.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h4 className="font-medium text-gray-900">Pending Invitations ({pendingInvites.length})</h4>
                </div>

                <div className="divide-y divide-gray-100">
                  {pendingInvites.map(invite => (
                    <div key={invite.id} className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Mail size={20} className="text-amber-600" />
                        </div>
                        
                        <div>
                          <p className="font-medium text-gray-900">{invite.email}</p>
                          <p className="text-sm text-gray-500">
                            Invited as {invite.role} • {new Date(invite.created_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-400">
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyInviteLink(invite.id)}
                          className="p-2 text-gray-500 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Copy invite link"
                        >
                          {copiedInvite === invite.id ? (
                            <Check size={16} className="text-green-500" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => cancelInvitation(invite.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Cancel invitation"
                        >
                          <X size={16} />
                        </motion.button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Hub Modal */}
      <CreateHubModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateHub}
        loading={loading}
      />

      {/* Invite Member Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteMember}
        loading={loading}
      />

      {/* Delete Hub Modal */}
      <DeleteHubModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteHub}
        hubName={currentHub.name}
        loading={loading}
      />
    </div>
  );
};

// Create Hub Modal Component
const CreateHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateHubData) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<CreateHubData>({
    name: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', description: '' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Create New Hub</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Hub Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter hub name"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                  placeholder="Describe your family hub..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Hub'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Invite Member Modal Component
const InviteMemberModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: InviteMemberData) => void;
  loading: boolean;
}> = ({ isOpen, onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState<InviteMemberData>({
    email: '',
    role: 'member'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email.trim()) {
      onSubmit(formData);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', role: 'member' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Invite Member</h2>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter email address"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'manager' | 'member' }))}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Managers can invite and manage other members
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || !formData.email.trim()}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send Invitation'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Delete Hub Modal Component
const DeleteHubModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hubName: string;
  loading: boolean;
}> = ({ isOpen, onClose, onConfirm, hubName, loading }) => {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmed = confirmText === hubName;

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Delete Hub</h2>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to delete <strong>{hubName}</strong>? This will permanently delete:
              </p>
              
              <ul className="text-sm text-gray-600 space-y-1 ml-4">
                <li>• All hub data and settings</li>
                <li>• All member access</li>
                <li>• All associated tasks and events</li>
                <li>• All shopping lists and items</li>
              </ul>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Type <strong>{hubName}</strong> to confirm:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={hubName}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isConfirmed ? 1.02 : 1 }}
                  whileTap={{ scale: isConfirmed ? 0.98 : 1 }}
                  onClick={onConfirm}
                  disabled={loading || !isConfirmed}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Deleting...' : 'Delete Hub'}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HubSettings;