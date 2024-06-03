import {defineConfig} from 'vite'
import { viteElectronPlugin } from './vite-electron-plugin'
export default defineConfig({
    plugins:[
        viteElectronPlugin(),
    ],
})