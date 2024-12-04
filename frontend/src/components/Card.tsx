import React from 'react'

interface CardProps {
  className?: string
  children: React.ReactNode
}

const Card: React.FC<CardProps> = ({ className, children }) => {
  return (
    <div
      className={`${className} rounded-lg bg-card flex items-center justify-between w-full p-5 text-white cursor-pointer`}
    >
      <div className="flex flex-row items-center w-full">
        <div className="flex-1">{children}</div>
      </div>
    </div>
  )
}

export default Card
