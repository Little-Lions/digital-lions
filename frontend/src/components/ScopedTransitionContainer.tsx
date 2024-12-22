'use client'

import React, { useContext } from 'react'
import { TransitionContext } from '@/providers/TransitionProvider'

export const ScopedTransitionContainer: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  const context = useContext(TransitionContext)

  if (!context) {
    throw new Error(
      'ScopedTransitionContainer must be used within a TransitionProvider',
    )
  }

  const { className } = context

  return <div className={`transition-container ${className}`}>{children}</div>
}
