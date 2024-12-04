'use client'

import React from 'react'

import Card from '@/components/Card'
import NavigationButton from '@/components/NavigationButton'
import ButtonGroup from '@/components/ButtonGroup'

const UnauthorizedPage: React.FC = () => {
  return (
    <Card className="bg-white">
      <div className="mx-auto max-w-screen-sm text-center">
        <h1 className="mb-4 text-2xl tracking-tight font-extrabold text-gray-900">
          401
        </h1>

        <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl">
          Unauthorized Access
        </p>
        <p className="mb-4 text-lg font-light text-gray-700">
          Sorry, you don’t have access to this page. Please log in to continue
          or go back to home.
        </p>
        <div className="border-t border-gray-200">
          <ButtonGroup className="mt-4">
            <NavigationButton
              label="Login"
              href="/api/auth/login"
              isFullWidth={true}
              variant="secondary"
              useBackNavigation={false}
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
