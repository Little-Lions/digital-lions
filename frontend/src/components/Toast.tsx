"use client";

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

interface ToastProps {
  message: string;
  variant?: "success" | "error" | "warning";
  isCloseable?: boolean;
  onClose?: () => void;
  position?: "bottom-center" | "bottom-end" | "top-end" | "top-center";
}

const Toast: React.FC<ToastProps> = ({
  message,
  variant = "success",
  isCloseable = true,
  onClose,
  position = "bottom-center", // Default placement
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const variantStyles = {
    success: {
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z" />
        </svg>
      ),
      color: "text-green-500 bg-green-100 dark:bg-green-800 dark:text-green-200",
    },
    error: {
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
        </svg>
      ),
      color: "text-red-500 bg-red-100 dark:bg-red-800 dark:text-red-200",
    },
    warning: {
      icon: (
        <svg
          className="w-5 h-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z" />
        </svg>
      ),
      color: "text-orange-500 bg-orange-100 dark:bg-orange-700 dark:text-orange-200",
    },
  };

  useEffect(() => {
    const autoClose = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 5000);

    return () => clearTimeout(autoClose);
  }, [onClose]);

  if (!isVisible) return null;

  // Dynamic positioning logic
  const positionStyles = {
    "bottom-center": "fixed bottom-16 left-1/2 transform -translate-x-1/2",
    "bottom-end": "fixed bottom-16 right-5",
    "top-end": "fixed top-5 right-5",
    "top-center": "fixed top-5 left-1/2 transform -translate-x-1/2",
  };

  const mobileStyles =
    "w-full max-w-xs p-4 mb-4 mx-2 flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800";

    const toastContent = (
    <div
      className={`${positionStyles[position]} ${mobileStyles}`}
      role="alert"
    >
      <div
        className={`inline-flex items-center justify-center flex-shrink-0 w-8 h-8 rounded-lg ${variantStyles[variant].color}`}
      >
        {variantStyles[variant].icon}
      </div>
      <div className="ml-3 text-sm font-normal">{message}</div>
      {isCloseable && (
        <button
          type="button"
          className="ml-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}
          aria-label="Close"
        >
          <span className="sr-only">Close</span>
          <svg
            className="w-3 h-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      )}
    </div>
  );

  return ReactDOM.createPortal(toastContent, document.body);
};

export default Toast;
