import type { Config } from 'tailwindcss';

/** @type {Config} */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)', 
        foreground: 'var(--foreground)', 
        primary: {
          50: '#F3E8FF',
          100: '#D6BBFC',
          200: '#A884F8',
          300: '#8A5BF7',
          400: '#6E37F5',
          500: '#5727CC',
          600: '#471D9A',
          700: '#391677',
          800: '#2C0F55',
          900: '#1E0934',
        },
        secondary: {
          50: '#D9FBE9',
          100: '#B7F0C5',
          200: '#85E3A4',
          300: '#53D282',
          400: '#2CB56C',
          500: '#19994F',
          600: '#137841',
          700: '#105A36',
          800: '#0C3D2A',
          900: '#08281D',
        },
      },
      fontFamily: {
        sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'), 
  ],
};

export default config;
