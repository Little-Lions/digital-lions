'use client'

import React, { useState } from 'react'

import Card from '@/components/ui/Card'
import NavigationButton from '@/components/ui/NavigationButton'
import ButtonGroup from '@/components/ui/ButtonGroup'
import Heading from '@/components/ui/Heading'
import Text from '@/components/ui/Text'
import CustomButton from '@/components/ui/CustomButton'

const UnauthorizedPage: React.FC = () => {
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleLogin = async (): Promise<void> => {
    setIsLoggingIn(true)
    try {
      setTimeout(() => {
        window.location.href = '/api/auth/login'
      }, 10)
    } catch (error) {
      console.error('Login failed:', error)
      setIsLoggingIn(false)
    }
  }

  return (
    <Card className="bg-white pointer">
      <div className="mx-auto max-w-screen-sm text-center">
        <Heading level="h2" className="text-red-500">
          401
        </Heading>
        <Text className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
          Unauthorized Access
        </Text>
        <Text className="mb-4 text-lg font-light text-gray-700">
          Sorry, you don’t have access to this page. Please log in to continue
          or go back to home.
        </Text>
        <div className="border-t border-gray-200">
          <ButtonGroup className="mt-4">
            <CustomButton
              label="Login"
              onClick={handleLogin}
              variant="secondary"
              isFullWidth={true}
              isBusy={isLoggingIn}
            />
            <NavigationButton
              label="Go back"
              href="/"
              variant="outline"
              isFullWidth={true}
              useBackNavigation={false}
              className="text-gray-900"
            />
          </ButtonGroup>
        </div>
      </div>
    </Card>
  )
}

export default UnauthorizedPage
