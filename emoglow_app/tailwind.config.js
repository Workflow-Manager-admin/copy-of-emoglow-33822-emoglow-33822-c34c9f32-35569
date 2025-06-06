module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#e3f2fd",
        secondary: "#ffffff",
        accent: "#ff9800",
        dark: "#18181b",
      },
      backgroundImage: {
        'mood-gradient': 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
        'mood-dark': 'linear-gradient(135deg, #18181b 0%, #28314d 100%)'
      },
    },
  },
  plugins: [],
};
