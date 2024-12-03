import React from 'react'

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
        <div className="text-sm font-medium text-gray-900 ">{label}</div>
        <div className="text-sm ">{value}</div>
      </div>
    </div>
  )
}

export default ListItem
