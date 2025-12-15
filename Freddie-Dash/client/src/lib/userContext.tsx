import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Admin' | 'View';

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface UserContextType {
  user: User;
  setUser: (user: User) => void;
  isAdmin: boolean;
}

const defaultUser: User = {
  name: 'John Doe',
  email: 'john.doe@freddiemac.com',
  role: 'Admin',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  // Try to load from localStorage to persist across reloads
  const [user, setUserState] = useState<User>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : defaultUser;
  });

  const setUser = (newUser: User) => {
    setUserState(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const isAdmin = user.role === 'Admin';

  return (
    <UserContext.Provider value={{ user, setUser, isAdmin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export const USERS: User[] = [
  {
    name: 'John Doe',
    email: 'john.doe@freddiemac.com',
    role: 'Admin',
  },
  {
    name: 'Test User',
    email: 'test.user@freddiemac.com',
    role: 'View',
  },
];
