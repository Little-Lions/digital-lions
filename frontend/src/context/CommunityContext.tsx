'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface CommunityContextProps {
  communityName: string | null
  setCommunityName: (name: string | null) => void
}

const CommunityContext = createContext<CommunityContextProps | undefined>(
  undefined,
)

export const CommunityProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [communityName, setCommunityName] = useState<string | null>(null)

  return (
    <CommunityContext.Provider value={{ communityName, setCommunityName }}>
      {children}
    </CommunityContext.Provider>
  )
}

export const useCommunity = (): CommunityContextProps => {
  const context = useContext(CommunityContext)
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider')
  }
  return context
}
