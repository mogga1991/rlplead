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
        'fed-green': {
          50: '#f0f5f0',
          100: '#d9e5d9',
          200: '#b3cab3',
          500: '#4a5d4a',
          700: '#2d3d2d',
          900: '#1a2e1a',
        },
        'cream': '#f8f7f4',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
