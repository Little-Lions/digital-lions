import React from "react";
import Link from "next/link"; 

interface LinkCardProps {
  title: string;
  className?: string;
  href: string;
  state?: { communityName?: string | null; teamName?: string | null };
  children?: React.ReactNode;
}

const LinkCard: React.FC<LinkCardProps> = ({ title, className, href, state, children }) => {
  const handleClick = () => {
    if (state) {
      localStorage.setItem("linkCardState", JSON.stringify(state)); 
    }
  };

  return (
    <Link href={href} onClick={handleClick}>
      <div
        className={`${className} rounded-lg bg-card flex items-center justify-between w-full p-5 font-medium text-white hover:bg-card-dark dark:hover:bg-gray-800 transition-colors cursor-pointer`}
      >
        <h2 className="flex-1 text-left flex items-center">{title}</h2>

        <div className="flex items-center space-x-2">
          {children && <div className="flex gap-2">{children}</div>}
          <svg
            className="w-3 h-3 transition-transform"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 6 10"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 1l4 4-4 4"
            />
          </svg>
        </div>
      </div>
    </Link>
  );
};

export default LinkCard;
