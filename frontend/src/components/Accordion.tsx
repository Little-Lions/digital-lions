'use client'

import React, { useState } from 'react'

import Heading from './Heading'
import Text from './Text'

interface AccordionProps {
  title?: string
  description?: string
  id: string
  children: React.ReactNode
  className?: string
  index?: number
  totalItems?: number
  accordionRefs?: React.MutableRefObject<(HTMLButtonElement | null)[]>
  isDisabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  description,
  id,
  children,
  className,
  index,
  totalItems,
  accordionRefs,
  isDisabled,
  onClick,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const toggleAccordion = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    setIsOpen(!isOpen)

    if (onClick && !isOpen) {
      onClick(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (!accordionRefs || index === undefined || totalItems === undefined)
      return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        accordionRefs.current[(index + 1) % totalItems]?.focus()
        break
      case 'ArrowUp':
        e.preventDefault()
        accordionRefs.current[(index - 1 + totalItems) % totalItems]?.focus()
        break
      case 'Home':
        e.preventDefault()
        accordionRefs.current[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        accordionRefs.current[totalItems - 1]?.focus()
        break
      default:
        break
    }
  }

  return (
    <div
      id="accordion-open"
      data-accordion="open"
      className={`${className} rounded-lg`}
    >
      <button
        ref={(el) => {
          if (accordionRefs?.current && index !== undefined) {
            accordionRefs.current[index] = el
          }
        }}
        id={`${id}-header`}
        aria-expanded={isOpen}
        aria-controls={`${id}-body`}
        onClick={toggleAccordion}
        onKeyDown={handleKeyDown}
        disabled={isDisabled}
        aria-disabled={isDisabled ? 'true' : undefined}
        tabIndex={isDisabled ? -1 : 0}
        type="button"
        className={`rounded-t-lg ${isOpen ? 'rounded-none' : 'rounded-lg'} bg-card flex items-center justify-between w-full p-5 font-medium text-white hover:bg-card-dark ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Heading level="h6" hasNoMargin={true} className="flex items-center">
          {title}
        </Heading>
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
      <div
        id={`${id}-body`}
        aria-labelledby={`${id}-header`}
        role="region"
        className={`transition-max-height duration-50 ease-in-out ${
          isOpen ? 'max-h-screen' : 'max-h-0'
        }`}
        style={{
          overflow: isOpen ? 'visible' : 'hidden',
        }}
      >
        <div className="bg-card p-5 rounded-b-lg">
          {description && (
            <Text className="mb-2 text-gray-500 ">{description}</Text>
          )}
          <div>{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Accordion
