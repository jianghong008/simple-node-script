import {ViteDevServer} from 'vite'
import {spawn} from 'node:child_process'
export const viteElectronPlugin = () => ({
    name: 'vite-electron-plugin',
    configureServer(server:ViteDevServer) {
        // tsc
        spawn('tsc', ['src/electron/main.ts','src/electron/preload.ts', '--outDir out','--module nodenext','--watch'],{
            shell: true,
        })
        // electron
        const port = server.config.server.port??5173
        spawn('npx', ['electron', '.',port.toString()],{
            shell: true,
        })
    },
  })