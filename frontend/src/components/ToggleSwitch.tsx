'use client'

import React, { useState, useCallback } from "react";

interface ToggleSwitchProps {
  onChange: (isActive: boolean) => void;
  initialChecked?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  onChange,
  initialChecked = true,
}) => {
  const [isChecked, setIsChecked] = useState(initialChecked);

  const handleChange = useCallback(() => {
    const newCheckedState = !isChecked;
    setIsChecked(newCheckedState);
    onChange(newCheckedState);
  }, [isChecked, onChange]);

  return (
    <label className="inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={isChecked}
        onChange={handleChange}
      />
      <div
        className={`relative w-11 h-6 bg-gray-200 rounded-full peer dark:bg-gray-700 
    ${isChecked ? "peer-checked:bg-success" : "peer-checked:bg-gray-200"}
    peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full 
    peer-checked:after:border-white after:content-[''] after:absolute 
    after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 
    after:border after:rounded-full after:h-5 after:w-5 after:transition-all 
    dark:border-gray-600`}
      />
      <span
        className={`ms-3 text-sm font-medium ${
          isChecked ? "text-success" : "text-gray-400"
        } dark:text-gray-500`}
      >
        {isChecked ? "Active" : "Inactive"}
      </span>
    </label>
  );
};

export default ToggleSwitch;
