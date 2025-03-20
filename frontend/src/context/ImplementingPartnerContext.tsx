'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface ImplementingPartnerContextType {
  selectedImplementingPartnerId: number | null
  setSelectedImplementingPartnerId: (partnerId: number) => void
}

const ImplementingPartnerContext = createContext<
  ImplementingPartnerContextType | undefined
>(undefined)

export const ImplementingPartnerProvider: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const [selectedImplementingPartnerId, setSelectedImplementingPartnerId] =
    useState<number>(1)

  // Load saved implementing partner ID from localStorage on mount
  useEffect(() => {
    try {
      const savedPartnerId = localStorage.getItem(
        'selectedImplementingPartnerId',
      )
      if (savedPartnerId) {
        setSelectedImplementingPartnerId(JSON.parse(savedPartnerId))
      }
    } catch (error) {
      console.error(
        'Error reading selected implementing partner ID from localStorage:',
        error,
      )
    }
  }, [])

  // Save the selected implementing partner ID to localStorage whenever it changes
  const updateSelectedImplementingPartnerId = (partnerId: number): void => {
    setSelectedImplementingPartnerId(partnerId)
    localStorage.setItem(
      'selectedImplementingPartnerId',
      JSON.stringify(partnerId),
    )
  }

  return (
    <ImplementingPartnerContext.Provider
      value={{
        selectedImplementingPartnerId,
        setSelectedImplementingPartnerId: updateSelectedImplementingPartnerId,
      }}
    >
      {children}
    </ImplementingPartnerContext.Provider>
  )
}

export const useImplementingPartner = (): ImplementingPartnerContextType => {
  const context = useContext(ImplementingPartnerContext)
  if (!context) {
    throw new Error(
      'useImplementingPartner must be used within an ImplementingPartnerProvider',
    )
  }
  return context
}
