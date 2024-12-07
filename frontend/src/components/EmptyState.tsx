import React from 'react'

interface EmptyStateProps {
  title: string
  text?: string
  pictogram?: React.ReactNode
  actionButton?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  text,
  pictogram,
  actionButton,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6 border-2 border-dashed border-gray-300 rounded-lg">
      <div className="w-24 h-24 mb-4 flex items-center justify-center text-gray-300">
        {pictogram}
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      <p className="mt-2">{text}</p>
      <div className="mt-4">{actionButton}</div>
    </div>
  )
}

export default EmptyState
