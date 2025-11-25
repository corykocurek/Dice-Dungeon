/** @type {import('tailwindcss').Config} */
export default {
  content: [
      "./index.html",
          "./*.{js,ts,jsx,tsx}",
              "./components/**/*.{js,ts,jsx,tsx}",
                  "./utils/**/*.{js,ts,jsx,tsx}",
                    ],
                      safelist: [
                          // Explicitly safelist all stat colors to prevent purging issues
                              'bg-red-500', 'text-red-500', 'border-red-500',
                                  'bg-yellow-400', 'text-yellow-400', 'border-yellow-400',
                                      'bg-orange-500', 'text-orange-500', 'border-orange-500',
                                          'bg-blue-400', 'text-blue-400', 'border-blue-400',
                                              'bg-purple-400', 'text-purple-400', 'border-purple-400',
                                                  'bg-pink-400', 'text-pink-400', 'border-pink-400',
                                                    ],
                                                      theme: {
                                                          extend: {
                                                                fontFamily: {
                                                                        retro: ['"Press Start 2P"', 'cursive'],
                                                                                mono: ['"VT323"', 'monospace'],
                                                                                      },
                                                                                            animation: {
                                                                                                    'bounce-slow': 'bounce 3s infinite',
                                                                                                            'tumble': 'tumble 0.5s ease-in-out',
                                                                                                                    'scroll-grid': 'scroll-grid 1s linear infinite',
                                                                                                                          },
                                                                                                                                keyframes: {
                                                                                                                                        tumble: {
                                                                                                                                                  '0%': { transform: 'rotate(0deg) scale(1)' },
                                                                                                                                                            '25%': { transform: 'rotate(90deg) scale(1.1)' },
                                                                                                                                                                      '50%': { transform: 'rotate(180deg) scale(1)' },
                                                                                                                                                                                '75%': { transform: 'rotate(270deg) scale(1.1)' },
                                                                                                                                                                                          '100%': { transform: 'rotate(360deg) scale(1)' },
                                                                                                                                                                                                  },
                                                                                                                                                                                                          'scroll-grid': {
                                                                                                                                                                                                                    '0%': { backgroundPosition: '0 0' },
                                                                                                                                                                                                                              '100%': { backgroundPosition: '0 40px' },
                                                                                                                                                                                                                                      }
                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                },
                                                                                                                                                                                                                                                  },
                                                                                                                                                                                                                                                    plugins: [],
                                                                                                                                                                                                                                                    } */