import React, {createContext, useState, useContext} from 'react';
import Notification from '../components/Notification';
// Create context for notifications
const NotificationContext = createContext();

// Custom hook to access notifications in any component
export const useNotification = () => {
  return useContext(NotificationContext);
};

// Notification provider
export const NotificationProvider = ({children}) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // success | error
  const [showNotificationFlag, setShowNotificationFlag] = useState(false);

  // Function to show notification
  const showNotification = (msg, notificationType = 'success') => {
    setMessage(msg);
    setType(notificationType);
    setShowNotificationFlag(true);

    // Automatically hide the notification after 3 seconds
    setTimeout(() => {
      setShowNotificationFlag(false);
    }, 3000);
  };

  const dismissNotification = () => {
    setShowNotificationFlag(false); // Manually dismiss notification
  };

  return (
    <NotificationContext.Provider value={{showNotification}}>
      {children}
      {showNotificationFlag && (
        <Notification
          message={message}
          type={type}
          onClose={dismissNotification}
        />
      )}
    </NotificationContext.Provider>
  );
};
