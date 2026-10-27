/** Configure the WriteSpace palette and scanned application files. */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          indigo: '#4f46e5',
          violet: '#7c3aed',
          pink: '#ec4899',
          teal: '#14b8a6',
        },
      },
      fontFamily: {
        display: ['Outfit', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
