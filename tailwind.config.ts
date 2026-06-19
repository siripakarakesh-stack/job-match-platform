import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0F1E',
        surface: '#111827',
        'surface-border': 'rgba(255,255,255,0.07)',
        primary: '#6366F1',
        'primary-dark': '#4F46E5',
        secondary: '#22D3EE',
        success: '#10B981',
        error: '#EF4444',
        'text-primary': '#F9FAFB',
        'text-muted': '#6B7280',
      },
      fontFamily: {
        body: ['Inter', 'sans-serif'],
        heading: ['Sora', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        input: '8px',
        pill: '999px',
      },
      transitionDuration: {
        default: '200ms',
      },
      animation: {
        shimmer: 'shimmer 3s linear infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
