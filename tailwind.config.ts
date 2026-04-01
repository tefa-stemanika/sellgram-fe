import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--error))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          dark: 'hsl(142 65% 35%)'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          dark: 'hsl(38 82% 40%)'
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          dark: 'hsl(0 74% 50%)'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          dark: 'hsl(217 81% 50%)'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      fontSize: {
        'page-title': ['2.5rem', { lineHeight: '3rem', fontWeight: '700', letterSpacing: '-0.015em' }],
        'section-header': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.015em' }],
        'subsection-header': ['1.5rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'card-title': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'small-header': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        body: ['0.94rem', { lineHeight: '1.6rem', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.4rem', fontWeight: '400' }],
        caption: ['0.8rem', { lineHeight: '1.2rem', fontWeight: '500' }],
        label: ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }]
      },
      spacing: {
        '4.5': '1.125rem',
        '5.5': '1.375rem',
        '6.5': '1.625rem',
        '7.5': '1.875rem',
        '8.5': '2.125rem',
        '9.5': '2.375rem',
        '10.5': '2.625rem',
        '12.5': '3.125rem',
        '14.5': '3.625rem',
        '16': '4rem',
        '18': '4.5rem',
        '20': '5rem',
        '24': '6rem',
        '28': '7rem',
        '32': '8rem',
        '36': '9rem',
        '40': '10rem',
        '44': '11rem',
        '48': '12rem',
        '52': '13rem',
        '56': '14rem',
        '60': '15rem',
        '64': '16rem',
        '72': '18rem',
        '80': '20rem',
        '96': '24rem'
      },
      borderRadius: {
        xl: '1rem',
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xs: '0.375rem'
      },
      shadow: {
        l1: '0 1px 3px rgb(0 0 0 / 0.05)',
        l2: '0 4px 12px rgb(0 0 0 / 0.08)',
        l3: '0 8px 24px rgb(0 0 0 / 0.12)',
        glass: '0 8px 32px rgb(31 41 55 / 0.1)',
        'glow-primary': 'inset 0 1px 3px rgb(59 90 248 / 0.1), 0 0 0 3px rgb(59 90 248 / 0.1)',
        'glow-accent': 'inset 0 1px 3px rgb(0 212 212 / 0.1), 0 0 0 3px rgb(0 212 212 / 0.1)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'fade-in': {
          from: {
            opacity: '0'
          },
          to: {
            opacity: '1'
          }
        },
        'slide-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-in-up': 'slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      },
      transitionDuration: {
        '250': '250ms',
        '350': '350ms'
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        responsive: 'cubic-bezier(0.16, 1, 0.3, 1)',
        decelerate: 'cubic-bezier(0.7, 0, 0.84, 0)'
      }
    }
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require('tailwindcss-animate')]
}
export default config
