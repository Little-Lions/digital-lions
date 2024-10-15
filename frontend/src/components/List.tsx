import React from 'react';
import ListItem from './ListItem'

interface ListProps {
  items: {
    icon?: React.ReactNode;
    label: string;
    value: string;
  }[];
}

const List: React.FC<ListProps> = ({ items }) => {
  return (
    <div >
      {items.map((item, index) => (
        <ListItem
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
        />
      ))}
    </div>
  );
};

export default List;
