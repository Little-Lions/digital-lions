import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    fontFamily: {
      sans: ['Work Sans', 'sans-serif'],
    },
    extend: {
      animation: {
        'slide-left-out': '0.4s ease-in forwards slide-left-out',
        'slide-left-in': '0.4s ease-out slide-left-in',
        'slide-right-out': '0.4s ease-in forwards slide-right-out',
        'slide-right-in': '0.4s ease-out slide-right-in',
      },
      keyframes: {
        'slide-left-out': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
        'slide-left-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
        'slide-right-out': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(100%)' },
        },
        'slide-right-in': {
          from: { transform: 'translateX(-100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      spacing: {
        'page-x': '2rem',
        'page-y': '4rem',
        'gap-large': '3rem',
        'gap-medium': '2rem',
        'gap-small': '1rem',
        'page-margin': '4rem',
        'page-padding': '2rem',
      },
      colors: {
        /* Button Background Colors */
        'button-primary': 'var(--color-button-primary)',
        'button-secondary': 'var(--color-button-secondary)',
        'button-error': 'var(--color-button-error)',
        'button-success': 'var(--color-success)',
        'button-warning': 'var(--color-warning)',
        'button-text': 'var(--color-button-text)',
        'button-text-light': 'var(--color-button-text-light)',

        /* Background and Text Colors */
        background: 'var(--color-background)',
        'background-text': 'var(--color-background-text)',

        /* Footer Colors */
        'footer-background': 'var(--color-footer-background)',
        'footer-text': 'var(--color-footer-text)',

        /* Card Colors */
        card: 'var(--color-card)',
        'card-dark': 'var(--color-card-dark)',
        'card-secondary': 'var(--color-card-secondary)',
        'card-secondary-dark': 'var(--color-card-secondary-dark)',
        'card-text': 'var(--color-card-text)',
        border: 'var(--color-border)',
        'border-card': 'var(--color-border-card)',

        /* Primary and Secondary Colors */
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
        secondary: 'var(--color-secondary)',
        'secondary-dark': 'var(--color-secondary-dark)',

        /* Status Colors */
        success: 'var(--color-success)',
        'success-dark': 'var(--color-success-dark)',
        error: 'var(--color-error)',
        'error-dark': 'var(--color-error-dark)',
        warning: 'var(--color-warning)',
        'warning-dark': 'var(--color-warning-dark)',
        info: 'var(--color-info)',
        'info-dark': 'var(--color-info-dark)',

        /* Neutral and Light Colors */
        'neutral-light': 'var(--color-neutral-light)',

        /* Blue Accent Colors */
        'primary-blue': 'var(--color-primary-blue)',
        'primary-blue-dark': 'var(--color-primary-blue-dark)',

        /* Text Colors */
        'text-primary': 'var(--color-text)',
        'text-primary-light': 'var(--color-text-light)',
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['hover'],
    },
  },
  plugins: [],
}

export default config
