'use client'

import React, { useState, useEffect, useRef } from 'react'

interface TextInputProps {
  className?: string
  label?: string
  value?: string
  onChange?: (value: string) => void
  onBlur?: (value: string) => void
  required?: boolean
  errorMessage?: string
  placeholder?: string
  id?: string
  autoFocus?: boolean
}

const TextInput: React.FC<TextInputProps> = ({
  className,
  label,
  value = '',
  onChange,
  onBlur,
  required = false,
  errorMessage = '',
  placeholder = '',
  id = 'text-input',
  autoFocus = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState(value)
  const [isTouched, setIsTouched] = useState(false)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    setInputValue(event.target.value)
    if (onChange) {
      onChange(event.target.value)
    }
  }

  const handleBlur = (): void => {
    setIsTouched(true)
    if (onBlur) {
      onBlur(inputValue)
    }
  }

  const showError = required && isTouched && !inputValue

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-2 text-sm font-medium text-gray-900 ">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
          showError ? 'border-red-500' : ''
        }`}
        required={required}
        aria-invalid={showError}
        aria-describedby={showError ? `${id}-error` : undefined}
        autoFocus={autoFocus}
      />
      {showError && (
        <p id={`${id}-error`} className="text-red-500 text-sm mt-1">
          {errorMessage || 'This field is required'}
        </p>
      )}
    </div>
  )
}

export default TextInput
