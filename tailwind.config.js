/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4f46e5',
          dark: '#4338ca',
        },
        secondary: '#10b981',
        dark: '#1e293b',
        light: '#f8fafc',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        gray: {
          DEFAULT: '#64748b',
          light: '#e2e8f0',
        },
      },
    },
  },
  plugins: [],
} 