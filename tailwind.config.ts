import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // monday.com inspired palette
        primary: {
          50: '#f0f0ff',
          100: '#e0e0ff',
          200: '#c7c7ff',
          300: '#a3a3ff',
          400: '#8181ff',
          500: '#6161FF', // Lighter purple - hover
          600: '#5034FF', // Vibrant purple - accents
          700: '#4026cc',
          800: '#0b0b4a', // Dark blue - sidebar
          900: '#0F1048', // Deep navy - backgrounds
          950: '#0a0a30',
        },
        success: {
          50: '#e6fff2',
          100: '#ccffe5',
          200: '#99ffcc',
          300: '#66ffb3',
          400: '#33ff99',
          500: '#00C875', // Green - completed
          600: '#00a35e',
          700: '#007a46',
          800: '#00522f',
          900: '#002917',
        },
        warning: {
          50: '#fff8eb',
          100: '#ffefd6',
          200: '#ffdfad',
          300: '#ffcf85',
          400: '#ffbf5c',
          500: '#FDAB3D', // Orange - at risk
          600: '#d48a1f',
          700: '#a06817',
          800: '#6b4510',
          900: '#352308',
        },
        danger: {
          50: '#ffeef1',
          100: '#ffdce2',
          200: '#ffb9c5',
          300: '#ff96a9',
          400: '#ff738c',
          500: '#E2445C', // Red - overdue
          600: '#b8364a',
          700: '#8a2938',
          800: '#5c1b25',
          900: '#2e0e13',
        },
        info: {
          50: '#e6ffff',
          100: '#ccffff',
          200: '#99ffff',
          300: '#66ffff',
          400: '#33ffff',
          500: '#00D2D2', // Cyan - info
          600: '#00a8a8',
          700: '#007e7e',
          800: '#005454',
          900: '#002a2a',
        },
        // Neutral colors
        surface: {
          50: '#ffffff',
          100: '#F5F6F8', // Light gray - backgrounds
          200: '#e8eaed',
          300: '#d3d6db',
          400: '#9aa0a9',
          500: '#676d77',
          600: '#4b5057',
          700: '#323842',
          800: '#1e2329',
          900: '#0d1117',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '8px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 1px 4px rgba(0, 0, 0, 0.1)',
        'dropdown': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'modal': '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  plugins: [],
}

export default config
