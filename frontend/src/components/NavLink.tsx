import React from 'react';
import Link from 'next/link';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  includeSourceMenu?: boolean;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, className, includeSourceMenu = false, onClick }) => {
  const urlWithQuery = includeSourceMenu ? `${href}?source=menu` : href;

  return (
    <Link
      href={urlWithQuery}
      className={`text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium ${className}`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
};

export default NavLink;
