'use-client'

import React, { useState } from 'react'

interface DropDownProps {
  children: React.ReactNode
  showDropDown: boolean
}

const DropDown: React.FC<DropDownProps> = ({ children, showDropDown }) => {
  return (
    <div className="relative">
      {showDropDown ? (
        <div className="flex flex-col gap-2 absolute right-0 mt-2 w-48 rounded bg-gray-800 border border-gray-600 shadow-lg p-2">
          {children}
        </div>
      ) : null}
    </div>
  )
}

export default DropDown
