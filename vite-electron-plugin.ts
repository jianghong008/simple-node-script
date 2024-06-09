import {ViteDevServer} from 'vite'
import {spawn} from 'node:child_process'
export const viteElectronPlugin = () => ({
    name: 'vite-electron-plugin',
    configureServer(server:ViteDevServer) {
        // tsc
        spawn('tsc', ['src/electron/main.ts','src/electron/preload.cts', '--outDir out','--module nodenext','--watch'],{
            shell: true,
        })
        // electron
        const port = server.config.server.port??5173
        const win = spawn('cross-env NODE_ENV=development npx', ['electron', '.',port.toString()],{
            shell: true,
        })
        win.on('close', () => {
            server.close()
            console.log('close electron')
        })

        win.stdout.on('data', (data) => {
            console.log(`electron stdout: ${data}`)
        })
        win.stderr.on('data', (data) => {
            console.log(`electron stderr: ${data}`)
        })
    },
  })