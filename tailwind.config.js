/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './src/**/*.{js,jsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#00685f',
        'on-primary': '#ffffff',
        surface: '#f8f9ff',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#3d4947',
        outline: '#6d7a77',
        error: '#ba1a1a',
      },
    },
  },
  plugins: [],
};
