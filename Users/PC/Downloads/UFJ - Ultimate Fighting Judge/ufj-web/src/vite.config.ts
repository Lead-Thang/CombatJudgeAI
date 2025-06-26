export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: '.', // Match Vercel's output directory setting
    assetsDir: 'assets'
  },
  base: './',
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx']
  }
});