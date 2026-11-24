/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F8FAF9',   // Main background / warm white tint
          100: '#F1F7F3',  // Pale soft green background/tint
          200: '#E5F2EA',  // Soft green badge / button hover
          300: '#D1E8D9',  // Light green border / accent ring
          400: '#A8D5B5',  // Muted green badge/indicator
          500: '#4F9D69',  // Medium soft green accent
          600: '#2F7D4A',  // Primary dark green CTA button / active state
          700: '#1F6339',  // Deep green heading / text accent
          800: '#17231C',  // Primary text color
          900: '#111C16',  // Dark green text
          950: '#0B120E',
        },
        accent: {
          cyan: '#0284C7',
          violet: '#7C3AED',
          amber: '#D97706',
          rose: '#E11D48',
        },
        surface: {
          bg: '#F8FAF9',          // Main warm white background
          card: '#FFFFFF',        // Pure white card background
          subtle: '#F1F7F3',      // Pale green subtle surface
          hover: '#F4F7F5',       // Subtle hover background
          border: '#E3E9E5',      // Clean light border
          borderHover: '#C7D8CD', // Border hover highlight
          input: '#FFFFFF',       // Input field background
          muted: '#68756D',       // Muted secondary text
        },
        // Landing page palette (CloudFit-style sage / forest / cream)
        cf: {
          sage: '#BFCBC3',
          sageDark: '#AFBDB4',
          pill: '#ECECE5',
          ink: '#1F3A30',
          inkHover: '#2B4C3F',
          text: '#4B5A53',
          cream: '#F6F3EC',
          card: '#F4F1EA',
          line: '#E4DFD4',
          night: '#0A1A12',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Anton', 'Impact', 'sans-serif'],
        tight: ['Inter Tight', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-emerald': '0 4px 14px 0 rgba(47, 125, 74, 0.12)',
        'card-subtle': '0 2px 10px 0 rgba(23, 35, 28, 0.03)',
        'card-hover': '0 6px 20px 0 rgba(23, 35, 28, 0.06)',
        'modal': '0 20px 40px -15px rgba(23, 35, 28, 0.12)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'typing': 'typing 1.4s infinite ease-in-out',
      },
      keyframes: {
        typing: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.4' },
          '50%': { transform: 'scale(1.2)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
