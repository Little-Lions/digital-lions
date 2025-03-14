import React from 'react'
import clsx from 'clsx'

interface CardProps {
  className?: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={clsx(
        'rounded-lg bg-card flex items-center justify-between w-full p-5 text-white',
        className,
      )}
    >
      <div className="flex flex-row items-center w-full">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

export default Card
