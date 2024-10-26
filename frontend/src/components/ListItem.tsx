import React from 'react';

interface ListItemProps {
  icon?: React.ReactNode;
  label: string;
  value: string;
}

const ListItem: React.FC<ListItemProps> = ({ icon, label, value }) => {
  return (
    <div className="flex items-center">
      {icon && <div className="mr-4 text-gray-500 dark:text-gray-400">{icon}</div>}
      <div className="flex gap-2">
        <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
        <div className="text-sm dark:text-gray-400">{value}</div>
      </div>
    </div>
  );
};

export default ListItem;
