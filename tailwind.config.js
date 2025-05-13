module.exports = {
  content: [
    './views/**/*.{ejs,js,html}',
    './public/**/*.{js,html}',
    './src/**/*.{js,html,css}'
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
    }
  },
  plugins: [],
}