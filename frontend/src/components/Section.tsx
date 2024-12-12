import React, { ReactNode } from 'react'

interface SectionProps {
  className?: string // Tailwind utility classes or custom styles
  children: ReactNode // Content of the section
}

const Section: React.FC<SectionProps> = ({ className = '', children }) => {
  return <section className={`w-full ${className}`}>{children}</section>
}

export default Section
