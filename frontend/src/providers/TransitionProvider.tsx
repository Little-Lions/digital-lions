'use client'

import React, { createContext, useState, useRef } from 'react'

export type Animation = 'slide-left' | 'slide-right' | null

interface TransitionContextProps {
  animation: React.MutableRefObject<Animation>
  className: string
  setClassName: React.Dispatch<React.SetStateAction<string>>
}

export const TransitionContext = createContext<
  TransitionContextProps | undefined
>(undefined)

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const animation = useRef<Animation>(null)
  const [className, setClassName] = useState<string>('')

  return (
    <TransitionContext.Provider value={{ animation, className, setClassName }}>
      {children}
    </TransitionContext.Provider>
  )
}
