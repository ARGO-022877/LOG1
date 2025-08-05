
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // 1. 색상 시스템 (Refined Color System)
      colors: {
        'primary': '#FF8FA3',
        'secondary': '#42A5F5',
        'accent': '#66BB6A',
        'surface-primary': '#FFFFFF',
        'surface-secondary': '#FAFAF8',
        'text-primary': '#2C2825',
        'text-secondary': '#65605A',
        'error': '#D32F2F',
        'warning': '#FFA000',
        'success': '#66BB6A',
        // 기존 컬러도 유지
        blossom: {
          '50': '#FFF5F7',
          '100': '#FFE4E9',
          '300': '#FFC4D1',
          '500': '#FF8FA3',
          '700': '#E85D75'
        },
        sky: {
          '100': '#E3F2FD',
          '300': '#90CAF9',
          '500': '#42A5F5'
        },
        growth: {
          '100': '#E8F5E9',
          '300': '#A5D6A7',
          '500': '#66BB6A'
        },
      },
      // 2. 타이포그래피 (Typography)
      fontFamily: {
        sans: ['Helvetica Neue', 'Noto Sans KR', 'sans-serif'],
      },
      fontSize: {
        'display': '61px',
        'h1': '49px',
        'h2': '39px',
        'h3': '31px',
        'body-lg': '20px',
        'body': '16px',
        'caption': '13px',
      },
      // 3. 애니메이션 및 전환
      transitionDuration: {
        'instant': '100ms',
        'fast': '200ms',
        'normal': '300ms',
        'slow': '500ms',
      },
      // 4. 그림자 (Shadows for Hover effects)
      boxShadow: {
        'base': '0 2px 4px rgba(0,0,0,0.08)',
        'lg': '0 4px 8px rgba(0,0,0,0.12)',
      },
    },
    // 5. 그래픽 마스터 그리드 (Spacings,
    // in conjunction with a CSS Grid implementation)
    // 8px 기본 단위 사용
    spacing: {
      '0': '0',
      '1': '4px',
      '2': '8px',
      '3': '12px',
      '4': '16px',
      '5': '20px',
      '6': '24px',
      '8': '32px',
      '10': '40px',
      '12': '48px',
      '16': '64px',
      '20': '80px',
      '24': '96px',
    },
  },
  plugins: [],
}
export default config
