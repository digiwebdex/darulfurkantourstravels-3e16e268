import React from "react";

interface IMOIconProps {
  size?: number;
  className?: string;
}

const IMOIcon: React.FC<IMOIconProps> = ({ size = 24, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="24" cy="24" r="24" fill="#3B82F6"/>
      <path
        d="M24 12C17.373 12 12 17.373 12 24C12 30.627 17.373 36 24 36C30.627 36 36 30.627 36 24C36 17.373 30.627 12 24 12ZM24 14C29.523 14 34 18.477 34 24C34 29.523 29.523 34 24 34C18.477 34 14 29.523 14 24C14 18.477 18.477 14 24 14ZM20 20C18.895 20 18 20.895 18 22V26C18 27.105 18.895 28 20 28C21.105 28 22 27.105 22 26V22C22 20.895 21.105 20 20 20ZM28 20C26.895 20 26 20.895 26 22V26C26 27.105 26.895 28 28 28C29.105 28 30 27.105 30 26V22C30 20.895 29.105 20 28 20ZM24 28C22.343 28 21 29.343 21 31H27C27 29.343 25.657 28 24 28Z"
        fill="white"
      />
    </svg>
  );
};

export default IMOIcon;
