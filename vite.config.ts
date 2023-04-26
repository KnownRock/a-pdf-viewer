import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import fs from 'fs'

function readFiles(dir){
  const files = []
  const readDir = (dir) => {
    fs.readdirSync(dir).forEach((file) => {
      const filePath = `${dir}/${file}`
      const stat = fs.statSync(filePath)
      if (stat.isFile()) {
        files.push(filePath)
      } else if (stat.isDirectory()) {
        readDir(filePath)
      }
    })
  }
  readDir(dir)
  return files.map((file) => file.replace(`${dir}`, ''))
  // console.log()
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(),{
    name: 'my-plugin',
    closeBundle: {
      sequential: true,
      handler() {
        // console.log('closeBundle')
        const files = readFiles('./dist')
        const revisionFiles = files
        .filter((file) => {
          return !file.endsWith('.map') || file === '/sw.js' || file === '/files.js'
        })
        .map((file) => {
          return {
            url: file,
            revision: (+new Date())+ ''
          }
        })

        fs.writeFileSync('./dist/files.js', `const files = ${JSON.stringify(revisionFiles)}`)
      }
    }
  }],
  build: {
    // manifest: true
  },
  server:{
    port:5174
  }

})
