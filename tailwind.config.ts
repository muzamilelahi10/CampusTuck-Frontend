import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: '#16251F',
        lime: '#D8EF72',
        leaf: '#3D674B',
        coral: '#F6A17C',
        canvas: '#F8F8F3',
        'canvas-alt': '#EFF2E7',
        'canvas-soft': '#F1F4E9',
        line: '#E4E9E0',
        muted: '#68766E',
        slate: {50:'#F8F8F3',100:'#F1F4E9',200:'#E4E9E0',300:'#CCD5CA',400:'#88968C',500:'#68766E',600:'#526359',700:'#3D5146',800:'#283D32',900:'#16251F',950:'#101D17'},
        emerald: {50:'#F1F4E9',100:'#E9EDDC',200:'#D7E7D2',300:'#BBCFA9',400:'#D8EF72',500:'#3D674B',600:'#16251F',700:'#3D674B',800:'#294B37',900:'#16251F',950:'#101D17'},
      },
      borderRadius: {
        'card': '18px',
        'button': '12px',
        'pill': '9999px',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'DejaVu Sans', 'Arial', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
