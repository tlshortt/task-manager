/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-800': '#1e293b',
        'navy-900': '#0f172a',
        'purple-accent': '#8b5cf6',
        'blue-accent': '#3b82f6',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
  // Safelist for dynamic priority colors (Ralph will use these)
  safelist: [
    'bg-red-100', 'bg-red-500', 'text-red-700', 'border-red-300',
    'bg-yellow-100', 'bg-yellow-500', 'text-yellow-700', 'border-yellow-300',
    'bg-gray-100', 'bg-gray-500', 'text-gray-700', 'border-gray-300',
    'ring-red-500', 'ring-yellow-500', 'ring-gray-500',
  ],
}
