'use client'

import React, { useState } from "react";

interface CustomButtonProps {
  label: string;
  onClick?: () => void;
  className?: string;
  isBusy?: boolean;
  isDisabled?: boolean;
  isFullWidth?: boolean;
  variant?:
    | "primary"
    | "secondary"
    | "success"
    | "error"
    | "warning"
    | "outline"
    | "none";
}

const CustomButton: React.FC<CustomButtonProps> = ({
  label,
  onClick,
  className,
  isBusy,
  isDisabled,
  isFullWidth,
  variant = "primary",
}) => {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    if (onClick && !loading && !isDisabled) {
      setLoading(true);
      onClick();
      setTimeout(() => {
        setLoading(false);
      }, 1000); // Replace with actual async action
    }
  };

  let buttonClass = "relative py-2 px-4 rounded-lg text-sm";
  let buttonColorClass = "";
  let textColorClass = "bg-text";
  let borderColorClass = "border-transparent";

  switch (variant) {
    case "primary":
      buttonColorClass = "bg-primary hover:bg-primary-dark";
      textColorClass = "bg-text";
      break;
    case "secondary":
      buttonColorClass = "bg-secondary hover:bg-secondary-dark";
      textColorClass = "bg-text";
      break;
    case "success":
      buttonColorClass = "bg-success hover:bg-success-dark";
      textColorClass = "bg-text-light";
      break;
    case "error":
      buttonColorClass = "bg-error hover:bg-error-dark";
      textColorClass = "bg-text-light";
      break;
    case "warning":
      buttonColorClass = "bg-warning hover:bg-warning-dark";
      textColorClass = "bg-text-light";
      break;
    case "outline":
      buttonClass += " border";
      buttonColorClass = "hover:bg-neutral-light";
      textColorClass = "text-neutral-dark";
      borderColorClass = "border-neutral-500";
      break;
    case "none":
      buttonColorClass = "";
      break;
    default:
      break;
  }

  return (
    <button
      type="button"
      className={
        `${className} ${buttonClass} ${buttonColorClass} ${textColorClass} ${borderColorClass} 
        ${isFullWidth ? "w-full sm:w-auto" : ""}
        ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={handleClick}
      disabled={isBusy || isDisabled}
      style={{ minWidth: "8rem", minHeight: "2.5rem" }}
      aria-busy={isBusy}
    >
      {isBusy ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      ) : (
        label
      )}
    </button>
  );
};

export default CustomButton;
