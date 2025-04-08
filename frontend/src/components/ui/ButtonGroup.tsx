import React from 'react'
import clsx from 'clsx'

interface ButtonGroupProps {
  children: React.ReactNode
  className?: string
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
  return (
    <div className={clsx('flex gap-x-2 items-center justify-end', className)}>
      {children}
    </div>
  )
}

export default ButtonGroup
