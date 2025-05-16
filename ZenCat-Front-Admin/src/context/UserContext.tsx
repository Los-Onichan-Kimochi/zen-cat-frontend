import React, { createContext, useContext, useState } from 'react'
import { User } from '@/types/user'

interface UserContextType {
  user: User | null
  setUser: React.Dispatch<React.SetStateAction<User | null>>
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUserContext = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used within UserProvider')
  return ctx
}
