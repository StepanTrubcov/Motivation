'use client';

import React, { createContext, useContext, useState } from 'react';

const BottomNavContext = createContext();

export const useBottomNav = () => {
  const context = useContext(BottomNavContext);
  if (!context) {
    throw new Error('useBottomNav must be used within BottomNavProvider');
  }
  return context;
};

export const BottomNavProvider = ({ children }) => {
  const [showBottomNav, setShowBottomNav] = useState(false);

  return (
    <BottomNavContext.Provider value={{ showBottomNav, setShowBottomNav }}>
      {children}
    </BottomNavContext.Provider>
  );
};
