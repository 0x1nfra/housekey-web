import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Settings, Users, Bell } from "lucide-react";
import { useHubStore } from "../../store/hubStore";
import { useNavigate } from "react-router-dom";
import { shallow } from "zustand/shallow";

const HubSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { currentHub, userHubs, pendingInvites, switchHub, loading } =
    useHubStore(
      (state) => ({
        currentHub: state.currentHub,
        userHubs: state.userHubs,
        pendingInvites: state.pendingInvites,
        switchHub: state.switchHub,
        loading: state.loading,
      }),
      shallow
    );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleHubSwitch = async (hubId: string) => {
    if (hubId !== currentHub?.id) {
      await switchHub(hubId);
    }
    setIsOpen(false);
  };

  const handleCreateHub = () => {
    setIsOpen(false);
    navigate("/settings?tab=hub&action=create");
  };

  const handleManageHub = () => {
    setIsOpen(false);
    navigate("/settings?tab=hub");
  };

  if (!currentHub) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleCreateHub}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 dark:bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-700 transition-colors"
      >
        <Plus size={16} />
        <span className="font-medium">Create Hub</span>
      </motion.button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors min-w-[200px]"
        disabled={loading}
      >
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
              {currentHub.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="text-left flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
              {currentHub.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {userHubs.length} hub{userHubs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pendingInvites.length > 0 && (
            <div className="relative">
              <Bell size={16} className="text-amber-500 dark:text-amber-400" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
              </span>
            </div>
          )}

          <ChevronDown
            size={16}
            className={`text-gray-400 dark:text-gray-500 transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-50 min-w-[280px]"
          >
            {/* Current Hub Section */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                      {currentHub.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {currentHub.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Current Hub
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManageHub}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600/30 rounded-lg transition-colors"
                  title="Manage Hub"
                >
                  <Settings
                    size={16}
                    className="text-gray-500 dark:text-gray-400"
                  />
                </motion.button>
              </div>
            </div>

            {/* Other Hubs */}
            {userHubs.length > 1 && (
              <div className="py-2">
                <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Switch Hub
                </p>
                {userHubs
                  .filter((hub) => hub.id !== currentHub.id)
                  .map((hub) => (
                    <motion.button
                      key={hub.id}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => handleHubSwitch(hub.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600/30 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-bold text-sm">
                          {hub.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {hub.name}
                        </p>
                        {hub.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {hub.description}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  ))}
              </div>
            )}

            {/* Notifications */}
            {pendingInvites.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 py-2">
                <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  Pending Invitations ({pendingInvites.length})
                </p>
                {pendingInvites.slice(0, 3).map((invite) => (
                  <div key={invite.id} className="px-4 py-2">
                    <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                      <Bell
                        size={14}
                        className="text-amber-600 dark:text-amber-400"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-100 truncate">
                          {invite.email}
                        </p>
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                          Invited as {invite.role}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {pendingInvites.length > 3 && (
                  <p className="px-4 py-1 text-xs text-gray-500 dark:text-gray-400">
                    +{pendingInvites.length - 3} more invitations
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-100 dark:border-gray-700 py-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateHub}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600/30 transition-colors"
              >
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
                  <Plus
                    size={16}
                    className="text-emerald-600 dark:text-emerald-400"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Create New Hub
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start a new family space
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleManageHub}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600/30 transition-colors"
              >
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg flex items-center justify-center">
                  <Users
                    size={16}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    Manage Hubs
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Settings and members
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HubSelector;
