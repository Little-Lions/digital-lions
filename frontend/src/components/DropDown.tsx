'use client'

import React, { useEffect, useRef } from 'react'

interface DropDownProps {
  children: React.ReactNode
  showDropDown: boolean
  toggleDropdown: () => void
}

const DropDown: React.FC<DropDownProps> = ({
  children,
  showDropDown,
  toggleDropdown,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        toggleDropdown()
      }
    }

    if (showDropDown) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showDropDown, toggleDropdown])

  if (!showDropDown) return null // Don't render when hidden

  return (
    <div
      ref={dropdownRef}
      className="flex flex-col gap-2 absolute right-0 mt-2 w-48 rounded bg-gray-800 border border-gray-600 shadow-lg p-2"
    >
      {children}
    </div>
  )
}

export default DropDown
