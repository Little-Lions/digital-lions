import React from "react";

interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
}

const ButtonGroup: React.FC<ButtonGroupProps> = ({ children, className }) => {
  return <div className={`flex gap-x-3 ${className}`}>{children}</div>;
};

export default ButtonGroup;
