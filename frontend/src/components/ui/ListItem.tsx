import React from 'react'

import Text from './Text'

interface ListItemProps {
  icon?: React.ReactNode
  label: string
  value: string
}

const ListItem: React.FC<ListItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center">
      {icon && <div className="mr-4 text-gray-500 ">{icon}</div>}
      <div>
        <Text size="sm">
          {value} {label}
        </Text>
      </div>
    </div>
  )
}

export default ListItem
