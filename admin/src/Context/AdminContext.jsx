import React, { createContext, useContext } from "react";

const AdminContext = createContext();

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children, refreshCounts }) => {
  return (
    <AdminContext.Provider value={{ refreshCounts }}>
      {children}
    </AdminContext.Provider>
  );
};
