import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-display)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      },
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
          foreground: 'hsl(var(--primary-foreground))',
          hover: 'hsl(var(--primary-hover))'
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
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          fg: 'hsl(var(--success-fg))'
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          fg: 'hsl(var(--warning-fg))'
        },
        error: {
          DEFAULT: 'hsl(var(--error))',
          fg: 'hsl(var(--error-fg))'
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          fg: 'hsl(var(--info-fg))'
        },
        status: {
          processing: 'hsl(var(--processing))',
          confirmed: 'hsl(var(--confirmed))',
          neutral: 'hsl(var(--neutral))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
          grid: 'hsl(var(--chart-grid))',
          axis: 'hsl(var(--chart-axis))'
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
        'page-title': ['2rem', { lineHeight: '2.25rem', fontWeight: '600', letterSpacing: '-0.02em' }],
        'section-header': ['1.5rem', { lineHeight: '1.875rem', fontWeight: '600', letterSpacing: '-0.02em' }],
        'subsection-header': ['1.25rem', { lineHeight: '1.5rem', fontWeight: '600', letterSpacing: '-0.015em' }],
        'card-title': ['1.0625rem', { lineHeight: '1.25rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'small-header': ['0.9375rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        body: ['1rem', { lineHeight: '1.55', fontWeight: '400' }],
        'body-sm': ['0.875rem', { lineHeight: '1.45', fontWeight: '400' }],
        caption: ['0.8125rem', { lineHeight: '1.35rem', fontWeight: '500' }],
        label: ['0.8125rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'mono-data': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
        'display-hero': ['clamp(2.25rem, 4vw, 3.5rem)', { lineHeight: '1.05', fontWeight: '600', letterSpacing: '-0.03em' }]
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
        '2xl': 'var(--radius-2xl)',
        xl: 'var(--radius-xl)',
        lg: 'var(--radius)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
        xs: '0.3rem'
      },
      boxShadow: {
        l1: 'var(--shadow-l1)',
        l2: 'var(--shadow-l2)',
        l3: 'var(--shadow-l3)',
        card: 'var(--shadow-l1)',
        floating: 'var(--shadow-l3)'
      },
      container: {
        center: true,
        padding: { DEFAULT: '1.5rem' },
        screens: { lg: '1024px' }
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
        'fade-in-up': {
          from: {
            opacity: '0',
            transform: 'translateY(12px)'
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)'
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
        },
        shimmer: {
          '100%': {
            transform: 'translateX(100%)'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
        'slide-in-up': 'slide-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        shimmer: 'shimmer 1.6s ease-in-out infinite'
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
