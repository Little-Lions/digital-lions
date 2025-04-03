import React from 'react'
import clsx from 'clsx'

interface CardProps {
  className?: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={clsx('w-full rounded-lg bg-card text-white p-4', className)}
    >
      {children}
    </div>
  )
}

export default Card
