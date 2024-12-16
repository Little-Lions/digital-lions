'use client'

import React, { createContext, useState, useRef } from 'react'

export type Animation = 'slide-left' | 'slide-right' | null

interface TransitionContextProps {
  animation: React.MutableRefObject<Animation>
  className: string
  setClassName: React.Dispatch<React.SetStateAction<string>>
  isTransitioning: boolean
  setIsTransitioning: React.Dispatch<React.SetStateAction<boolean>>
}

export const TransitionContext = createContext<
  TransitionContextProps | undefined
>(undefined)

export const TransitionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const animation = useRef<Animation>(null)
  const [className, setClassName] = useState<string>('')
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false)

  return (
    <TransitionContext.Provider
      value={{
        animation,
        className,
        setClassName,
        isTransitioning,
        setIsTransitioning,
      }}
    >
      {children}
    </TransitionContext.Provider>
  )
}
