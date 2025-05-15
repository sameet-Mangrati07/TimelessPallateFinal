import React, { createContext, useContext, useState } from 'react';

// Create the context
const UserContext = createContext(null);

// Custom hook to use the context
export const useUser = () => useContext(UserContext);

// Provider component
export const UserProvider = ({ children }) => {
    const [auth, setAuth] = useState({ xt: "" });

    return (
        <UserContext.Provider value={{ auth, setAuth }}>
            {children}
        </UserContext.Provider>
    );
};
