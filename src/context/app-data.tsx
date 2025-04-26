'use client'

import { AppUser, Team } from '@/payload-types'
import React, { createContext, useContext, useState } from 'react'

interface AppDataContextValue {
  activeTeam: Team
  setActiveTeam: React.Dispatch<React.SetStateAction<Team>>
  appUser: AppUser
  userRole: 'owner' | 'member'
}

// Create the context
const AppDataContext = createContext<AppDataContextValue | undefined>(undefined)

// Create the provider component
export const AppDataProvider: React.FC<{
  children: React.ReactNode
  team: Team
  appUser: AppUser
  userRole: 'owner' | 'member'
}> = ({ children, team, appUser, userRole }) => {
  const [activeTeam, setActiveTeam] = useState<Team>(team)
  const [_appUser] = useState<AppUser>(appUser)
  const [_userRole] = useState<'owner' | 'member'>(userRole)

  return (
    <AppDataContext.Provider
      value={{ activeTeam, setActiveTeam, appUser: _appUser, userRole: _userRole }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

// Create a custom hook to use the TeamContext
export const useAppData = (): AppDataContextValue => {
  const context = useContext(AppDataContext)
  if (!context) {
    throw new Error('useAppData must be used within a AppDataProvider')
  }
  return context
}
