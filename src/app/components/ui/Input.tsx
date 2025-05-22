import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  // You can add custom props here if needed, e.g., error states
  hasError?: boolean;
}

export default function Input({ className, hasError, ...props }: InputProps) {
  const baseStyles = 
    "block w-full appearance-none rounded-md border px-3 py-2 shadow-sm placeholder-gray-400 focus:outline-none sm:text-sm text-gray-900";
  
  const borderStyles = hasError 
    ? "border-red-500 focus:border-red-500 focus:ring-red-500" 
    : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500";

  return (
    <input 
      className={`${baseStyles} ${borderStyles} ${className || ''}`}
      {...props} 
    />
  );
} 