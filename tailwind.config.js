/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--color-border)", // gray-200
        input: "var(--color-input)", // white
        ring: "var(--color-ring)", // blue-500
        background: "var(--color-background)", // white
        foreground: "var(--color-foreground)", // gray-800
        primary: {
          DEFAULT: "var(--color-primary)", // blue-500
          foreground: "var(--color-primary-foreground)", // white
        },
        secondary: {
          DEFAULT: "var(--color-secondary)", // gray-50
          foreground: "var(--color-secondary-foreground)", // gray-800
        },
        destructive: {
          DEFAULT: "var(--color-destructive)", // red-600
          foreground: "var(--color-destructive-foreground)", // white
        },
        muted: {
          DEFAULT: "var(--color-muted)", // gray-50
          foreground: "var(--color-muted-foreground)", // gray-500
        },
        accent: {
          DEFAULT: "var(--color-accent)", // amber-500
          foreground: "var(--color-accent-foreground)", // white
        },
        popover: {
          DEFAULT: "var(--color-popover)", // white
          foreground: "var(--color-popover-foreground)", // gray-800
        },
        card: {
          DEFAULT: "var(--color-card)", // white
          foreground: "var(--color-card-foreground)", // gray-800
        },
        success: {
          DEFAULT: "var(--color-success)", // emerald-500
          foreground: "var(--color-success-foreground)", // white
          deep: "var(--color-success-deep)", // emerald-600
        },
        warning: {
          DEFAULT: "var(--color-warning)", // amber-600
          foreground: "var(--color-warning-foreground)", // white
        },
        error: {
          DEFAULT: "var(--color-error)", // red-600
          foreground: "var(--color-error-foreground)", // white
        },
        surface: "var(--color-surface)", // #0a0a0c
        "text-primary": "var(--color-text-primary)", // #EDEDEF
        "text-secondary": "var(--color-text-secondary)", // #8A8F98
        brand: {
          blue: "#4353FF",
          "blue-hover": "#5668FF",
          secondary: "#7082FF",
          solar: "#FFAE00",
          "solar-hover": "#FFBE26",
          accent: "#8FA0FF",
          frost: "rgba(255, 255, 255, 0.05)",
          bg: "#05060D",
          darkText: "#EDEDEF",
          greyText: "#8A8F98",
          surface: "#0A0D1B",
          card: "rgba(10, 13, 27, 0.75)",
          border: "rgba(255, 255, 255, 0.06)",
        },
        linear: {
          deep: "#020307",
          bg: "#05060D",
          elevated: "#0a0d1b",
          surface: "rgba(255, 255, 255, 0.05)",
          surfaceHover: "rgba(255, 255, 255, 0.08)",
          text: "#EDEDEF",
          muted: "#8A8F98",
          subtle: "rgba(255, 255, 255, 0.60)",
          border: "rgba(255, 255, 255, 0.06)",
          borderHover: "rgba(255, 255, 255, 0.12)",
          accent: "#4353FF",
          accentBright: "#5668FF",
          accentGlow: "rgba(67, 83, 245, 0.35)",
          accentDim: "rgba(67, 83, 245, 0.14)",
          solar: "#FFAE00",
          solarGlow: "rgba(255, 174, 0, 0.35)",
        },
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "6px",
        xl: "20px",
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      boxShadow: {
        'elevation-1': '0 1px 2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        'elevation-2': '0 4px 16px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.06)',
        'elevation-3': '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'linear-card': '0 0 0 1px rgba(255,255,255,0.06), 0 2px 20px rgba(0,0,0,0.4), 0 0 40px rgba(0,0,0,0.2)',
        'linear-card-hover': '0 0 0 1px rgba(94,106,210,0.35), 0 8px 32px rgba(0,0,0,0.6), 0 0 30px rgba(94,106,210,0.15)',
        'linear-btn': '0 0 0 1px rgba(94,106,210,0.5), 0 4px 14px rgba(94,106,210,0.35), inset 0 1px 0 0 rgba(255,255,255,0.25)',
        'linear-btn-hover': '0 0 0 1px rgba(104,114,217,0.7), 0 6px 20px rgba(94,106,210,0.45), inset 0 1px 0 0 rgba(255,255,255,0.35)',
      },
      animation: {
        'spring': 'spring 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-fast': 'spring 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'spring-slow': 'spring 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
        '400': '400ms',
        '500': '500ms',
      },
      zIndex: {
        'header': '1000',
        'sidebar': '999',
        'workout-overlay': '998',
        'modal': '1001',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
}