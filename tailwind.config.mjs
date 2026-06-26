/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        teal: '#1E5B57',
        gold: '#C8962B',
        ink: '#1C1B19',
        paper: '#FBF9F4',
        'paper-pure': '#FFFFFF',
        'gold-soft': '#EBD9AE',
        stone: '#6B675E',
        line: '#E4DECF',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
