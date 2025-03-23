import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Custom colors for our marketplace
				'farm-green': {
					50: '#f7f7f7',
					100: '#e5e5e5',
					200: '#cccccc',
					300: '#b3b3b3',
					400: '#999999',
					500: '#666666',
					600: '#4d4d4d',
					700: '#333333',
					800: '#1a1a1a',
					900: '#0d0d0d',
					950: '#000000',
				},
				'harvest-gold': {
					50: '#fefce8',
					100: '#fef9c3',
					200: '#fef08a',
					300: '#fde047',
					400: '#facc15',
					500: '#eab308',
					600: '#ca8a04',
					700: '#a16207',
					800: '#854d0e',
					900: '#713f12',
					950: '#422006',
				},
				'soil-brown': {
					50: '#faf6f1',
					100: '#f0e6db',
					200: '#e0caaf',
					300: '#d1ac83',
					400: '#c18e5e',
					500: '#b77c4a',
					600: '#a76841',
					700: '#8a5337',
					800: '#724530',
					900: '#5e3a2a',
					950: '#331c15',
				},
				'fresh-blue': {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
					950: '#082f49',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
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
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
				},
				'fade-in': {
					'0%': {
						opacity: '0'
					},
					'100%': {
						opacity: '1'
					},
				},
				'fade-out': {
					'0%': {
						opacity: '1'
					},
					'100%': {
						opacity: '0'
					},
				},
				'bounce-subtle': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-5px)'
					}
				},
				'pulse-subtle': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
						opacity: '0.8'
					}
				},
				'slide-in-right': {
					'0%': {
						transform: 'translateX(100%)',
						opacity: '0'
					},
					'100%': {
						transform: 'translateX(0)',
						opacity: '1'
					}
				},
				'rotate-360': {
					'0%': {
						transform: 'rotate(0deg)'
					},
					'100%': {
						transform: 'rotate(360deg)'
					}
				},
				'scale-up': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0.5'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				},
				'wave': {
					'0%': { transform: 'rotate(0.0deg)' },
					'15%': { transform: 'rotate(14.0deg)' },
					'30%': { transform: 'rotate(-8.0deg)' },
					'40%': { transform: 'rotate(14.0deg)' },
					'50%': { transform: 'rotate(-4.0deg)' },
					'60%': { transform: 'rotate(10.0deg)' },
					'70%': { transform: 'rotate(0.0deg)' },
					'100%': { transform: 'rotate(0.0deg)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-1000px 0' },
					'100%': { backgroundPosition: '1000px 0' }
				},
				'morph': {
					'0%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' },
					'50%': { borderRadius: '30% 60% 70% 40%/50% 60% 30% 60%' },
					'100%': { borderRadius: '60% 40% 30% 70%/60% 30% 70% 40%' }
				},
				'flip': {
					'0%': { transform: 'perspective(400px) rotateY(0)' },
					'100%': { transform: 'perspective(400px) rotateY(360deg)' }
				},
				'text-rainbow': {
					'0%': { color: '#ff0000' },
					'16.66%': { color: '#ffff00' },
					'33.33%': { color: '#00ff00' },
					'50%': { color: '#00ffff' },
					'66.66%': { color: '#0000ff' },
					'83.33%': { color: '#ff00ff' },
					'100%': { color: '#ff0000' }
				},
				'glow': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' }
				},
				'glow-once': {
					'0%': { left: '-100%' },
					'100%': { left: '100%' }
				},
				'shake': {
					'0%, 100%': { transform: 'translateX(0)' },
					'25%': { transform: 'translateX(-5px)' },
					'75%': { transform: 'translateX(5px)' }
				},
				'spinner': {
					'0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
					'50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
					'100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' }
				},
				'jello': {
					'0%, 11.1%, 100%': { transform: 'none' },
					'22.2%': { transform: 'skewX(-12.5deg) skewY(-12.5deg)' },
					'33.3%': { transform: 'skewX(6.25deg) skewY(6.25deg)' },
					'44.4%': { transform: 'skewX(-3.125deg) skewY(-3.125deg)' },
					'55.5%': { transform: 'skewX(1.5625deg) skewY(1.5625deg)' },
					'66.6%': { transform: 'skewX(-0.78125deg) skewY(-0.78125deg)' },
					'77.7%': { transform: 'skewX(0.390625deg) skewY(0.390625deg)' },
					'88.8%': { transform: 'skewX(-0.1953125deg) skewY(-0.1953125deg)' }
				},
				'gradient-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'50%': { backgroundPosition: '100% 50%' },
					'100%': { backgroundPosition: '0% 50%' }
				},
				'tilt': {
					'0%, 50%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(2deg)' },
					'75%': { transform: 'rotate(-2deg)' }
				},
				'blur-in': {
					'0%': { filter: 'blur(10px)', opacity: '0' },
					'100%': { filter: 'blur(0)', opacity: '1' }
				},
				'scale-in-center': {
					'0%': { transform: 'scale(0)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'heartbeat': {
					'0%': { transform: 'scale(1)' },
					'14%': { transform: 'scale(1.1)' },
					'28%': { transform: 'scale(1)' },
					'42%': { transform: 'scale(1.1)' },
					'70%': { transform: 'scale(1)' }
				},
				'glitch': {
					'0%': { transform: 'translate(0)' },
					'20%': { transform: 'translate(-3px, 3px)' },
					'40%': { transform: 'translate(-3px, -3px)' },
					'60%': { transform: 'translate(3px, 3px)' },
					'80%': { transform: 'translate(3px, -3px)' },
					'100%': { transform: 'translate(0)' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)' },
					'100%': { transform: 'translateY(100%)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(-100%)' }
				},
				'slide-right': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'slide-left': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(-100%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.5s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-out',
				'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'rotate-360': 'rotate-360 1s linear infinite',
				'scale-up': 'scale-up 0.3s ease-out',
				'wave': 'wave 1.5s infinite',
				'float': 'float 3s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'morph': 'morph 8s linear infinite',
				'flip': 'flip 2s linear infinite',
				'text-rainbow': 'text-rainbow 5s linear infinite',
				'glow': 'glow 2s infinite',
				'glow-once': 'glow-once 1s forwards',
				'shake': 'shake 0.3s ease-in-out',
				'heartbeat': 'heartbeat 1.5s ease-in-out',
				'scale-in-center': 'scale-in-center 0.3s ease-out',
				'spinner': 'spinner 1.2s ease-in-out infinite',
				'jello': 'jello 2s ease-in-out',
				'gradient-flow': 'gradient-flow 3s ease infinite',
				'tilt': 'tilt 10s ease-in-out infinite',
				'blur-in': 'blur-in 0.5s ease-out',
				'glitch': 'glitch 0.8s infinite',
				'slide-down': 'slide-down 0.5s ease-in-out forwards',
				'slide-up': 'slide-up 0.5s ease-in-out forwards',
				'slide-right': 'slide-right 0.5s ease-in-out forwards',
				'slide-left': 'slide-left 0.5s ease-in-out forwards'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Montserrat', 'sans-serif'],
			}
		}
	},
	plugins: [
		require("tailwindcss-animate")
	],
} satisfies Config;
