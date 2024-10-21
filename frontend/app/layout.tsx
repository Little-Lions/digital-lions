"use client";

import React, { ReactNode, useRef } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import "@/styles/globals.css";
import "tailwindcss/tailwind.css";
import "@radix-ui/themes/styles.css";
import { UserProvider } from '@auth0/nextjs-auth0/client';

import { animate } from "framer-motion/dom";
import { TransitionRouter } from "next-transition-router";

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const wrapperRef = useRef<HTMLDivElement>(null!); 
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-background text-background-text">
      <UserProvider>

        <Navigation />
        <main className="flex-1">
          <div className="container mx-auto px-4 md:px-4 py-4 flex-1">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-start-1 lg:col-span-8 xl:col-span-6">
                <TransitionRouter
                  auto
                  leave={(next) => {
                    animate(
                      wrapperRef.current,
                      { opacity: [1, 0] },
                      { duration: 0.2, onComplete: next }
                    );
                  }}
                  enter={(next) => {
                    animate(
                      wrapperRef.current,
                      { opacity: [0, 1] },
                      { duration: 0.2, onComplete: next }
                    );
                  }}
                >
                  <div ref={wrapperRef}>{children}</div>
                </TransitionRouter>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </UserProvider>

      </body>
    </html>
  );
};

export default Layout;
