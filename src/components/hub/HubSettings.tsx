// import React, { useState, useEffect, useRef } from "react";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react";
import { shallow } from "zustand/shallow";
import { useHubStore } from "../../store/hubStore";
import {
  InviteMemberData,
  CreateHubData,
  // UpdateHubData,
} from "../../types/hub";
import CreateHubModal from "./modals/CreateHubModal";
import InviteMemberModal from "./modals/InviteMemberModal";
import DeleteHubModal from "./modals/DeleteHubModal";
import LeaveHubModal from "./modals/LeaveHubModal";
import dayjs from "dayjs";

interface HubSettingsProps {
  activeTab?: string;
  action?: string;
}

const HubSettings: React.FC<HubSettingsProps> = ({
  activeTab = "general",
  action,
}) => {
  const [currentTab, setCurrentTab] = useState(activeTab);
  const [showCreateModal, setShowCreateModal] = useState(action === "create");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const {
    currentHub,
    hubMembers,
    pendingInvites,
    // userInvitations,
    loading,
    error,
    createHub,
    updateHub,
    leaveHub,
    deleteHub,
    inviteMember,
    removeMember,
    // updateMemberRole,
    cancelInvitation,
    getHubPermissions,
    // switchHub,
    clearError,
  } = useHubStore(
    (state) => ({
      currentHub: state.currentHub,
      hubMembers: state.hubMembers,
      pendingInvites: state.pendingInvites,
      userInvitations: state.userInvitations,
      loading: state.loading,
      error: state.error,
      createHub: state.createHub,
      updateHub: state.updateHub,
      leaveHub: state.leaveHub,
      deleteHub: state.deleteHub,
      inviteMember: state.inviteMember,
      removeMember: state.removeMember,
      updateMemberRole: state.updateMemberRole,
      cancelInvitation: state.cancelInvitation,
      getHubPermissions: state.getHubPermissions,
      switchHub: state.switchHub,
      clearError: state.clearError,
    }),
    shallow
  );

  const permissions = getHubPermissions();

  useEffect(() => {
    if (action === "create") {
      setShowCreateModal(true);
    }
  }, [action]);

  useEffect(() => {
    if (currentHub) {
      setFormData({
        name: currentHub.name,
        description: currentHub.description || "",
      });
    }
  }, [currentHub]);

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "members", label: "Members", icon: Users },
    // {
    //   id: "invitations",
    //   label: "Invitations",
    //   icon: Inbox,
    //   badge: userInvitations.filter((inv) => !inv.is_expired).length,
    // },
  ];

  const roleIcons = {
    owner: Crown,
    manager: Shield,
    member: User,
  };

  const roleColors = {
    owner:
      "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50",
    manager:
      "text-indigo-600 bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/50",
    member: "text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-700",
  };

  const handleCreateHub = async (data: CreateHubData) => {
    const result = await createHub(data);
    if (result.success) {
      setShowCreateModal(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!currentHub) return;
    // Add updateHub call here
    await updateHub(currentHub.id, formData);
  };

  const handleInviteMember = async (data: InviteMemberData) => {
    if (!currentHub) return;

    const result = await inviteMember(currentHub.id, data);
    if (result.success) {
      setShowInviteModal(false);
    }
  };

  const handleLeaveHub = async () => {
    if (!currentHub) return;

    const result = await leaveHub(currentHub.id);
    if (result.success) {
      setShowLeaveModal(false);
    }
  };

  const handleDeleteHub = async () => {
    if (!currentHub) return;

    const result = await deleteHub(currentHub.id);
    if (result.success) {
      setShowDeleteModal(false);
    }
  };

  // FIXME: do we need this?
  // const handleHubSwitch = async (hubId: string) => {
  //   await switchHub(hubId);
  // };

  const copyInviteLink = async (inviteId: string) => {
    const inviteLink = `${window.location.origin}/invite/${inviteId}`;
    await navigator.clipboard.writeText(inviteLink);
    setCopiedInvite(inviteId);
    setTimeout(() => setCopiedInvite(null), 2000);
  };

  if (!currentHub) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          No Hub Selected
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Create or select a hub to manage settings
        </p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Create Your First Hub
        </motion.button>

        <CreateHubModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHub}
          loading={loading}
        />
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
          className="bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center justify-between">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors relative ${
                currentTab === tab.id
                  ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                  : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
              {/* {tab.badge && tab.badge > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {tab.badge}
                </span>
              )} */}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {currentTab === "general" && (
          <motion.div
            key="general"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Hub Information */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Hub Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Hub Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    disabled={!permissions.canManageHub}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                    placeholder="Describe your family hub..."
                    disabled={!permissions.canManageHub}
                  />
                </div>

                {permissions.canManageHub && (
                  <div className="flex gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveChanges}
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </motion.button>
                  </div>
                )}
              </div>
            </div>

            {/* Hub Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <Users
                      size={20}
                      className="text-indigo-600 dark:text-indigo-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {hubMembers.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Members
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
                    <Mail
                      size={20}
                      className="text-amber-600 dark:text-amber-400"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {pendingInvites.length}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Pending Invites
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                    <Settings
                      size={20}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Created
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {dayjs(currentHub.created_at).format("DD/MM/YYYY")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-red-300 mb-4">
                Danger Zone
              </h3>

              <div className="space-y-4">
                {/* Leave Hub */}
                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div>
                    <h4 className="font-medium text-amber-900 dark:text-amber-300">
                      Leave This Hub
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Remove yourself from this hub and lose access to all hub
                      content.
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowLeaveModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Leave Hub
                  </motion.button>
                </div>

                {/* Delete Hub */}
                {permissions.canDeleteHub && (
                  <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-300">
                        Delete Hub
                      </h4>
                      <p className="text-sm text-red-700 dark:text-red-400">
                        Permanently delete this hub and all its data. This
                        cannot be undone.
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
                )}
              </div>
            </div>
          </motion.div>
        )}

        {currentTab === "members" && (
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Hub Members
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
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
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-gray-100">
                  Current Members ({hubMembers.length})
                </h4>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {hubMembers.map((member) => {
                  const RoleIcon = roleIcons[member.role];

                  return (
                    <div
                      key={member.id}
                      className="p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-lg text-gray-900 dark:text-gray-100">
                            {member.user_profile?.name
                              ?.charAt(0)
                              .toUpperCase() || "?"}
                          </span>
                        </div>

                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {member.user_profile?.name || "Unknown User"}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {member.user_profile?.email}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Joined{" "}
                            {dayjs(member.joined_at).format("DD/MM/YYYY")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                            roleColors[member.role]
                          }`}
                        >
                          <RoleIcon size={14} />
                          <span className="capitalize">{member.role}</span>
                        </div>

                        {permissions.canRemoveMembers &&
                          member.role !== "owner" && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeMember(member.id)}
                              className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    Pending Invitations ({pendingInvites.length})
                  </h4>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {pendingInvites.map((invite) => (
                    <div
                      key={invite.id}
                      className="p-6 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                          <Mail
                            size={20}
                            className="text-amber-600 dark:text-amber-400"
                          />
                        </div>

                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {invite.email}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Invited as {invite.role} •{" "}
                            {dayjs(invite.created_at).format("DD/MM/YYYY")}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Expires{" "}
                            {dayjs(invite.expires_at).format("DD/MM/YYYY")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => copyInviteLink(invite.id)}
                          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Copy invite link"
                        >
                          {copiedInvite === invite.id ? (
                            <Check
                              size={16}
                              className="text-green-500 dark:text-green-400"
                            />
                          ) : (
                            <Copy size={16} />
                          )}
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => cancelInvitation(invite.id)}
                          className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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

        {/* {currentTab === "invitations" && (
          <motion.div
            key="invitations"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Your Invitations
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hub invitations you've received from other users
              </p>
            </div>

            <InvitationsList onHubSwitch={handleHubSwitch} />
          </motion.div>
        )} */}
      </AnimatePresence>

      {/* Modals */}
      <CreateHubModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateHub}
        loading={loading}
      />

      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={handleInviteMember}
        loading={loading}
      />

      <LeaveHubModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onConfirm={handleLeaveHub}
        hubName={currentHub.name}
        loading={loading}
      />

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

export default HubSettings;
