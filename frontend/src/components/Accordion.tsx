'use client'
import React, { useState } from 'react'

interface AccordionProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  description,
  children,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleAccordion = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div
      id="accordion-open"
      data-accordion="open"
      className={`${className} rounded-lg`}
    >
      <h2 id="accordion-open-heading-1">
        <button
          onClick={toggleAccordion}
          type="button"
          className={`rounded-t-lg ${isOpen ? 'rounded-none' : 'rounded-lg'} bg-card flex items-center justify-between w-full p-5 font-medium text-white hover:bg-card-dark`}
          data-accordion-target="#accordion-open-body-1"
          aria-expanded={isOpen}
          aria-controls="accordion-open-body-1"
        >
          <span className="flex items-center">{title}</span>
          <svg
            data-accordion-icon
            className={`w-3 h-3 ${!isOpen ? 'rotate-180' : ''} transition-transform`}
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 10 6"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5 5 1 1 5"
            />
          </svg>
        </button>
      </h2>
      <div
        id="accordion-open-body-1"
        className={`transition-max-height duration-50 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
        aria-labelledby="accordion-open-heading-1"
        style={{
          overflow: isOpen ? 'visible' : 'hidden',
        }}
      >
        <div className="bg-card p-5 rounded-b-lg">
          <p className="mb-2 text-gray-500 ">{description}</p>
          <p className="">{children}</p>
        </div>
      </div>
    </div>
  )
}

export default Accordion
