/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E2749',
        secondary: '#F5E6D3',
        accent: '#FF7F6B',
        background: '#FDFBF7',
        darkPrimary: '#E0E0E0', // Example dark primary text
        darkSecondary: '#A0A0A0', // Example dark secondary text
        darkAccent: '#FF9F8B', // Example dark accent
        darkBackground: '#121212', // Example dark background
        darkSurface: '#1E1E1E', // Example dark surface for cards/modals
      },
      fontFamily: {
        franie: ['Franie', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      backgroundImage: {
        'geometric-pattern': "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%231E2749\" fill-opacity=\"0.05\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
    },
  },
  plugins: [],
};