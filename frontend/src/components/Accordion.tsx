'use client'

import React from 'react'
import clsx from 'clsx'

import Heading from './Heading'
import Text from './Text'

interface AccordionProps {
  title: string | React.ReactNode
  description?: string
  id: string
  children: React.ReactNode
  className?: string
  index?: number
  totalItems?: number
  buttonRefs?: React.MutableRefObject<(HTMLButtonElement | null)[]>
  panelRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>
  isDisabled?: boolean
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  isOpen?: boolean
}

const Accordion: React.FC<AccordionProps> = ({
  title,
  description,
  id,
  children,
  className,
  index,
  totalItems,
  buttonRefs = { current: [] },
  panelRefs = { current: [] },
  isDisabled,
  onClick,
  isOpen,
}) => {
  const toggleAccordion = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ): void => {
    if (onClick) {
      onClick(e)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (!buttonRefs.current || index === undefined || totalItems === undefined)
      return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (index < totalItems - 1) {
          buttonRefs.current[index + 1]?.focus()
        }
        break
      case 'ArrowUp':
        e.preventDefault()
        if (index > 0) {
          buttonRefs.current[index - 1]?.focus()
        }
        break
      case 'Home':
        e.preventDefault()
        buttonRefs.current[0]?.focus()
        break
      case 'End':
        e.preventDefault()
        buttonRefs.current[totalItems - 1]?.focus()
        break
      default:
        break
    }
  }

  return (
    <div
      id="accordion-open"
      data-accordion="open"
      className={clsx(className, 'rounded-lg')}
    >
      <button
        ref={(el) => {
          if (buttonRefs.current && index !== undefined) {
            buttonRefs.current[index] = el
          }
        }}
        id={`${id}-header`}
        aria-expanded={isOpen}
        aria-controls={`${id}-body`}
        onClick={toggleAccordion}
        disabled={isDisabled}
        aria-disabled={isDisabled ? 'true' : undefined}
        tabIndex={isDisabled ? -1 : 0}
        type="button"
        onKeyDown={handleKeyDown}
        className={clsx(
          'bg-card flex items-center justify-between w-full p-5 font-medium text-white',
          isOpen ? ' rounded-t-lg' : 'rounded-lg rounded-t-lg',
          !isDisabled && 'hover:bg-card-dark',
        )}
      >
        <Heading level="default" hasNoMargin={true}>
          {title}
        </Heading>
        {!isDisabled && (
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
        )}
      </button>
      <div
        ref={(el) => {
          if (panelRefs.current && index !== undefined) {
            panelRefs.current[index] = el
          }
        }}
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
