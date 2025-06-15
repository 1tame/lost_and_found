// NotificationContext.js
import React, { createContext, useState, useContext } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [newClaimCount, setNewClaimCount] = useState(0);
  const [updatedClaimCount, setUpdatedClaimCount] = useState(0);

  return (
    <NotificationContext.Provider value={{
      newClaimCount, setNewClaimCount,
      updatedClaimCount, setUpdatedClaimCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
