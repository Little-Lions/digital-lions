import React from 'react'
import Spinner from './Spinner'

interface LoaderProps {
  loadingText?: string
}

const Loader: React.FC<LoaderProps> = ({ loadingText = 'Loading...' }) => {
  return (
    <div
      className="fixed top-0 left-0 z-50 w-screen h-screen flex items-center justify-center"
      style={{ background: 'rgba(0, 0, 0, 0.3)' }}
    >
      <div className="bg-white border py-4 px-5 rounded-lg w-48 flex flex-col items-center">
        <Spinner />

        <div className="text-gray-500 text-sm font-medium mt-2 text-center">
          {loadingText}
        </div>
      </div>
    </div>
  )
}

export default Loader
