import React from 'react'
import Spinner from './Spinner'

interface LoadingOverlayProps {
  loading: boolean
  children: React.ReactNode
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
}) => {
  return (
    <div className="relative">
      <div className={loading ? 'blur-sm opacity-60 pointer-events-none' : ''}>
        {children}
      </div>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </div>
      )}
    </div>
  )
}

export default LoadingOverlay
