import React from "react";
import Link from "next/link";

interface NavLinkProps {
  href?: string;
  children: React.ReactNode;
  className?: string;
  includeSourceMenu?: boolean;
  onClick?: () => void;
  variant?: "primary" | "secondary";
  isExternal?: boolean; 
}

const NavLink: React.FC<NavLinkProps> = ({
  href = "#",
  children,
  className,
  includeSourceMenu = false,
  onClick,
  isExternal = false,
}) => {
  const urlWithQuery = includeSourceMenu ? `${href}?source=menu` : href;

  // Handle external links (such as Auth0 logout) with a regular <a> tag
  if (isExternal) {
    return (
      <a
        href={href}
        className={`${className} text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium ${className}`}
        onClick={onClick}
      >
        {children}
      </a>
    );
  }

  // For internal links, use Next.js Link component
  return (
    <Link
      href={urlWithQuery}
      className={`${className} text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavLink;
