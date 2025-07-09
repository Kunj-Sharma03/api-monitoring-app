/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sidebar: 'hsl(240, 10%, 10%)',
        'sidebar-foreground': 'hsl(0, 0%, 90%)',
        'sidebar-accent': 'hsl(240, 20%, 20%)',
        'sidebar-accent-foreground': 'hsl(0, 0%, 100%)',
        'sidebar-border': 'hsl(240, 15%, 15%)',
        'sidebar-ring': 'hsl(240, 20%, 30%)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  safelist: [
    "w-[var(--sidebar-width)]",
    "w-[var(--sidebar-width-icon)]",
    "group-data-[state=collapsed]/sidebar-wrapper:w-[var(--sidebar-width-icon)]",
    "group-hover/sidebar-wrapper:w-[var(--sidebar-width)]",
    "group-data-[collapsible=icon]:w-[var(--sidebar-width-icon)]",
    "group-data-[variant=floating]:border",
    "group-data-[variant=floating]:shadow-sm",
    "group-data-[side=left]:border-r",
    "group-data-[side=right]:border-l",
  ],
  plugins: [
    require("tailwindcss-animate"),
  ],
};
