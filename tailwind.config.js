/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}', './app.jsx'],
  theme: {
    extend: {
      colors: {
        cream: '#ffffeb',
        cream2: '#f6f6e0',
        line: '#e4e4d0',
        ink: '#1a1a1a',
        ink2: '#4a4a43',
        mute: '#8c8c80',
        ghost: '#c9c9b8',
        blue: '#0041ca',
        blue2: '#0033a3',
        orange: '#ffa946',
        lav: '#f0d7ff',
        pink: '#ffbcf2',
        mint: '#34d399',
        green: '#034f46',
      },
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', '"Noto Sans Devanagari"', 'system-ui', 'sans-serif'],
        hindi: ['"Noto Sans Devanagari"', '"DM Sans"', 'sans-serif'],
      },
      boxShadow: {
        'hard-sm': '2px 2px 0 #1a1a1a',
        'hard': '3px 3px 0 #1a1a1a',
        'hard-md': '4px 4px 0 #1a1a1a',
        'hard-lg': '5px 5px 0 #1a1a1a',
        'hard-xl': '6px 6px 0 #1a1a1a',
      },
    },
  },
  plugins: [],
};
