import React, { ReactNode } from 'react'
import clsx from 'clsx'

interface SectionProps {
  className?: string
  children: ReactNode
}

const Section: React.FC<SectionProps> = ({ className, children }) => {
  return <section className={clsx('w-full', className)}>{children}</section>
}

export default Section
