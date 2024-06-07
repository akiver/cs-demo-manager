import plugin from 'tailwindcss/plugin';
import { type Config } from 'tailwindcss';

const tooltipArrowStyle = {
  content: `''`,
  position: 'absolute',
  'border-width': '5px',
  'border-style': 'solid',
  'pointer-events': 'none',
};

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      white: '#ffffff',
      black: '#000000',
      gray: {
        50: 'var(--gray-50)',
        75: 'var(--gray-75)',
        100: 'var(--gray-100)',
        200: 'var(--gray-200)',
        300: 'var(--gray-300)',
        400: 'var(--gray-400)',
        500: 'var(--gray-500)',
        600: 'var(--gray-600)',
        700: 'var(--gray-700)',
        800: 'var(--gray-800)',
        900: 'var(--gray-900)',
      },
      red: {
        400: 'var(--red-400)',
        500: 'var(--red-500)',
        600: 'var(--red-600)',
        700: 'var(--red-700)',
      },
      green: {
        400: 'var(--green-400)',
        500: 'var(--green-500)',
        600: 'var(--green-600)',
        700: 'var(--green-700)',
      },
      blue: {
        400: 'var(--blue-400)',
        500: 'var(--blue-500)',
        600: 'var(--blue-600)',
        700: 'var(--blue-700)',
      },
      orange: {
        400: 'var(--orange-400)',
        500: 'var(--orange-500)',
        600: 'var(--orange-600)',
        700: 'var(--orange-700)',
      },
      overlay: 'var(--overlay-color)',
      cs: {
        gray: 'var(--cs-gray)',
        yellow: 'var(--cs-yellow)',
        purple: 'var(--cs-purple)',
        green: 'var(--cs-green)',
        blue: 'var(--cs-blue)',
        orange: 'var(--cs-orange)',
        'rating-tier-0': 'var(--cs-rating-tier-0)',
        'rating-tier-1': 'var(--cs-rating-tier-1)',
        'rating-tier-2': 'var(--cs-rating-tier-2)',
        'rating-tier-3': 'var(--cs-rating-tier-3)',
        'rating-tier-4': 'var(--cs-rating-tier-4)',
        'rating-tier-5': 'var(--cs-rating-tier-5)',
        'rating-tier-6': 'var(--cs-rating-tier-6)',
      },
      ct: '#378ef0',
      terro: '#f29423',
      'vac-ban': '#d7373f',
      'game-ban': '#bd640d',
      'community-ban': '#6d28d9',
    },
    fontFamily: {
      sans: ['Inter var', 'system-ui'],
    },
    spacing: {
      '0': '0',
      px: '1px',
      '4': '4px',
      '8': '8px',
      '12': '12px',
      '16': '16px',
      '20': '20px',
      '24': '24px',
      '28': '28px',
      '32': '32px',
      '40': '40px',
      '48': '48px',
    },
    borderRadius: {
      '0': '0px',
      DEFAULT: '4px',
      '4': '4px',
      '8': '8px',
      full: '9999px',
    },
    fontSize: {
      caption: [
        '12px',
        {
          lineHeight: '16px',
          fontWeight: '400',
        },
      ],
      body: [
        '14px',
        {
          lineHeight: '20px',
          fontWeight: '400',
        },
      ],
      'body-strong': [
        '14px',
        {
          lineHeight: '20px',
          fontWeight: '600',
        },
      ],
      subtitle: [
        '20px',
        {
          lineHeight: '28px',
          fontWeight: '600',
        },
      ],
      title: [
        '28px',
        {
          lineHeight: '36px',
          fontWeight: '600',
        },
      ],
    },
    extend: {
      minWidth: {
        '40': '40px',
        '48': '48px',
      },
      transitionProperty: {
        'stroke-dashoffset': 'stroke-dashoffset',
      },
      transitionDuration: {
        85: '85ms',
        850: '850ms',
      },
      keyframes: {
        'grow-height': {
          '0%': { maxHeight: '0%' },
          '100%': { maxHeight: '100%' },
        },
      },
      animation: {
        'grow-height': 'grow-height 0.3s ease-in',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, addVariant }) {
      addVariant('aria-disabled', `[aria-disabled="true"]&`);
      addUtilities({
        '.drag': {
          '-webkit-app-region': 'drag',
        },
        '.no-drag': {
          '-webkit-app-region': 'no-drag',
        },
        '.drag-element': {
          '-webkit-user-drag': 'element',
        },
        '.drag-none': {
          '-webkit-user-drag': 'none',
        },
        '.appearance-v-slider': {
          'writing-mode': 'vertical-lr',
          direction: 'rtl',
        },
        '.scrollbar-stable': {
          'scrollbar-gutter': 'stable',
        },
        '.selectable': {
          'user-select': 'text',
          cursor: 'default',
        },
        '.z-1': {
          'z-index': '1',
        },
        '.no-scrollbar': {
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.tooltip-right': {
          '&::after': {
            ...tooltipArrowStyle,
            'margin-top': '-5px',
            'border-color': 'transparent var(--gray-400) transparent transparent',
            top: '50%',
            right: '100%',
            'pointer-events': 'none',
          },
        },
        '.tooltip-left': {
          '&::after': {
            ...tooltipArrowStyle,
            'margin-top': '-5px',
            'border-color': 'transparent transparent transparent var(--gray-400)',
            top: '50%',
            left: '100%',
          },
        },
        '.tooltip-top': {
          '&::after': {
            ...tooltipArrowStyle,
            'margin-left': '-5px',
            'border-color': 'var(--gray-400) transparent transparent transparent',
            top: '100%',
            left: '50%',
          },
        },
        '.tooltip-bottom': {
          '&::after': {
            ...tooltipArrowStyle,
            'margin-left': '-5px',
            'border-color': 'transparent transparent var(--gray-400) transparent',
            bottom: '100%',
            left: '50%',
          },
        },
      });
    }),
  ],
};

export default config;
