import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontFamily: {
      sans: ["Work Sans", "sans-serif"],
    },
    extend: {
      colors: {
        /* Button Background Colors */
        'button-primary': 'var(--color-button-primary)',          // Primary button color (light tan)
        'button-secondary': 'var(--color-button-secondary)',      // Secondary button color (muted yellow)
        'button-error': 'var(--color-button-error)',              // Error button color (muted red-orange)
        'button-success': 'var(--color-success)',                 // Success button color (green)
        'button-warning': 'var(--color-warning)',                 // Warning button color (orange)
        'button-text': 'var(--color-button-text)',                // Dark text for light buttons
        'button-text-light': 'var(--color-button-text-light)',    // Light text for dark buttons
    
        /* Background and Text Colors */
        'background': 'var(--color-background)',                  // Background color
        'background-text': 'var(--color-background-text)',        // Text color on background
    
        /* Footer Colors */
        'footer-background': 'var(--color-footer-background)',    // Footer background color
        'footer-text': 'var(--color-footer-text)',                // Footer text color
    
        /* Card Colors */
        'card': 'var(--color-card)',                              // Primary card color
        'card-dark': 'var(--color-card-dark)',                    // Card hover color
        'card-secondary': 'var(--color-card-secondary)',          // Secondary card color
        'card-secondary-dark': 'var(--color-card-secondary-dark)',// Secondary card hover color
        'card-text': 'var(--color-card-text)',                    // Text color in cards
        'border': 'var(--color-border)',                          // Standard border color
        'border-card': 'var(--color-border-card)',                // Card border color
    
        /* Primary and Secondary Colors */
        'primary': 'var(--color-primary)',                        // Primary color - white
        'primary-dark': 'var(--color-primary-dark)',              // Darker shade of primary
        'secondary': 'var(--color-button-secondary)',             // Secondary color for buttons and highlights
        'secondary-dark': 'var(--color-secondary-dark)',          // Darker secondary color
    
        /* Status Colors */
        'success': 'var(--color-success)',                        // Success green (used for bg-button-success)
        'success-dark': 'var(--color-success-dark)',              // Darker success green
        'error': 'var(--color-error)',                            // Error color
        'error-dark': 'var(--color-error-dark)',                  // Darker error color
        'warning': 'var(--color-warning)',                        // Warning orange (used for bg-button-warning)
        'warning-dark': 'var(--color-warning-dark)',              // Darker warning color
        'neutral-light': 'var(--color-neutral-light)',            // Light neutral for outlines
    
        /* Blue Accent Colors */
        'primary-blue': 'var(--color-primary-blue)',              // Standard blue
        'primary-blue-dark': 'var(--color-primary-blue-dark)',    // Darker blue
    
        /* Text Colors */
        'text-primary': 'var(--color-text)',                      // Dark text
        'text-primary-light': 'var(--color-text-light)',          // Light text for dark backgrounds
      },
    },
    
  },
  variants: {
    extend: {
      backgroundColor: ["hover"],
    },
  },
  plugins: [],
};
export default config;
