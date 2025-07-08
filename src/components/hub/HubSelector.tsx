import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Settings, Users, Bell } from "lucide-react";
import { useHubStore } from "../../store/hub";
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
        className="flex items-center gap-2 w-full px-3 py-2 bg-sage-green dark:bg-sage-green text-deep-charcoal rounded-lg hover:bg-sage-green-hover dark:hover:bg-sage-green-hover transition-colors"
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
        className="flex items-center gap-3 w-full p-2 bg-sage-green-light border border-sage-green/20 rounded-lg hover:bg-sage-green/10 transition-colors"
        disabled={loading}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-8 h-8 bg-sage-green rounded flex items-center justify-center flex-shrink-0">
            <span className="font-interface font-bold text-deep-charcoal text-sm">
              {currentHub.name.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="text-left flex-1 min-w-0">
            <p className="font-interface font-semibold text-deep-charcoal text-sm truncate">
              {currentHub.name}
            </p>
            <p className="font-interface text-xs text-gray-600">
              {userHubs.length} hub{userHubs.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {pendingInvites.length > 0 && (
            <div className="relative">
              <Bell size={14} className="text-amber-500 dark:text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 dark:bg-red-600 rounded-full flex items-center justify-center">
                <span className="w-1 h-1 bg-white rounded-full" />
              </span>
            </div>
          )}

          <ChevronDown
            size={16}
            className={`text-gray-400 transition-transform ${
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
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-deep-charcoal rounded-xl shadow-lg dark:shadow-2xl border border-gray-200 dark:border-charcoal-light py-2 z-50 w-64"
          >
            {/* Current Hub Section */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-charcoal-light">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-sage-green rounded-lg flex items-center justify-center">
                    <span className="font-interface font-bold text-deep-charcoal">
                      {currentHub.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-interface font-semibold text-deep-charcoal dark:text-warm-off-white">
                      {currentHub.name}
                    </p>
                    <p className="font-interface text-sm text-gray-600 dark:text-charcoal-light">
                      Current Hub
                    </p>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleManageHub}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-charcoal-light/30 rounded-lg transition-colors"
                  title="Manage Hub"
                >
                  <Settings
                    size={16}
                    className="text-gray-500 dark:text-charcoal-light"
                  />
                </motion.button>
              </div>
            </div>

            {/* Other Hubs */}
            {userHubs.length > 1 && (
              <div className="py-2">
                <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-charcoal-light uppercase tracking-wide">
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
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-charcoal-light/30 transition-colors"
                    >
                      <div className="w-8 h-8 bg-sage-green-light rounded-lg flex items-center justify-center">
                        <span className="text-sage-green-dark dark:text-sage-green-light font-bold text-sm">
                          {hub.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-interface font-semibold text-deep-charcoal dark:text-warm-off-white">
                          {hub.name}
                        </p>
                        {hub.description && (
                          <p className="font-interface text-sm text-gray-600 dark:text-charcoal-light truncate">
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
              <div className="border-t border-gray-100 dark:border-charcoal-light py-2">
                <p className="px-4 py-2 text-xs font-medium text-gray-500 dark:text-charcoal-light uppercase tracking-wide">
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
                  <p className="px-4 py-1 text-xs text-gray-500 dark:text-charcoal-light">
                    +{pendingInvites.length - 3} more invitations
                  </p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="border-t border-gray-100 dark:border-charcoal-light py-2">
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateHub}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-charcoal-light/30 transition-colors"
              >
                <div className="w-8 h-8 bg-sage-green dark:bg-sage-green-medium rounded-lg flex items-center justify-center">
                  <Plus
                    size={16}
                    className="text-deep-charcoal dark:text-deep-charcoal"
                  />
                </div>
                <div>
                  <p className="font-interface font-semibold text-deep-charcoal dark:text-warm-off-white">
                    Create New Hub
                  </p>
                  <p className="font-interface text-sm text-gray-600 dark:text-charcoal-light">
                    Start a new family space
                  </p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleManageHub}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-charcoal-light/30 transition-colors"
              >
                <div className="w-8 h-8 bg-sage-green-light dark:bg-sage-green-deep/50 rounded-lg flex items-center justify-center">
                  <Users
                    size={16}
                    className="text-sage-green-dark dark:text-deep-charcoal"
                  />
                </div>
                <div>
                  <p className="font-interface font-semibold text-deep-charcoal dark:text-warm-off-white">
                    Manage Hubs
                  </p>
                  <p className="font-interface text-sm text-gray-600 dark:text-charcoal-light">
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
