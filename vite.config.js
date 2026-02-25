import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs'

export default defineConfig({
  root: './public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'public/index.html')
      }
    }
  },
  plugins: [
    {
      name: 'copy-static-files',
      closeBundle: () => {
        try {
          console.log('Copying static files...')
          // Copy novels directory and novels_list.json to dist
          const sourceNovelsDir = resolve(__dirname, 'public/novels')
          const targetNovelsDir = resolve(__dirname, 'dist/novels')
          const sourceNovelsList = resolve(__dirname, 'public/novels_list.json')
          const targetNovelsList = resolve(__dirname, 'dist/novels_list.json')
          
          console.log(`Source novels dir: ${sourceNovelsDir}`)
          console.log(`Target novels dir: ${targetNovelsDir}`)
          console.log(`Source novels list: ${sourceNovelsList}`)
          console.log(`Target novels list: ${targetNovelsList}`)
          
          // Create novels directory if it doesn't exist
          mkdirSync(targetNovelsDir, { recursive: true })
          console.log('Created novels directory')
          
          // Copy novels_list.json
          copyFileSync(sourceNovelsList, targetNovelsList)
          console.log('Copied novels_list.json')
          
          // Copy novels directory contents to both novels directory and root directory
          const novelFiles = readdirSync(sourceNovelsDir)
          console.log(`Found ${novelFiles.length} novel files`)
          novelFiles.forEach(file => {
            const sourceFile = resolve(sourceNovelsDir, file)
            const targetFileInNovels = resolve(targetNovelsDir, file)
            const targetFileInRoot = resolve(__dirname, 'dist', file)
            if (statSync(sourceFile).isFile()) {
              copyFileSync(sourceFile, targetFileInNovels)
              copyFileSync(sourceFile, targetFileInRoot)
              console.log(`Copied ${file} to both novels directory and root directory`)
            }
          })
          console.log('Static files copied successfully!')
        } catch (error) {
          console.error('Error copying static files:', error)
        }
      }
    }
  ]
})
