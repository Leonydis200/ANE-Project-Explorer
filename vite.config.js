// vite.config.js
import eslint from 'vite-plugin-eslint'

export default defineConfig({
  plugins: [
    eslint({
      overrideConfigFile: path.resolve(__dirname, '.eslintrc.json')
    })
  ]
})