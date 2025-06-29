import React, { useEffect, useRef } from "react";
import { useNotificationsStore } from "../../store/notifications";
import { shallow } from "zustand/shallow";

// This component doesn't render anything visible but plays sounds when new notifications arrive
const NotificationSound: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const { notifications } = useNotificationsStore(
    (state) => ({
      notifications: state.notifications,
    }),
    shallow
  );

  // Play sound when new notifications arrive
  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[0];
      const now = new Date();
      const notificationTime = new Date(latestNotification.created_at);

      // Only play sound for notifications less than 5 seconds old
      if (now.getTime() - notificationTime.getTime() < 5000) {
        if (audioRef.current) {
          audioRef.current.play().catch((e) => {
            // Browser may block autoplay
            console.error("Audio play prevented by browser policy: ", e);
          });
        }
      }
    }
  }, [notifications]);

  return (
    <audio
      ref={audioRef}
      src="/notification.mp3"
      preload="auto"
      style={{ display: "none" }}
    />
  );
};

export default NotificationSound;
