/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        flow: {
          bg: '#0B0F14',
          card: '#111827',
          accent: '#8B5CF6',
          accent2: '#06B6D4',
          text: '#E5E7EB',
          sub: '#9CA3AF',
        },
      },
    },
  },
  plugins: [],
};


