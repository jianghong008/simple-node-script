import { app, BrowserWindow } from 'electron'
import path from 'path'
import { protocol } from 'electron'
protocol.registerSchemesAsPrivileged([
  { scheme: 'foo', privileges: { bypassCSP: true } }
])
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            preload:path.join(process.cwd(), 'out/preload.js'),
            
        }
    })
    
    if (process.env.NODE_ENV === 'development') {
        const port = process.argv[2]??'5173'
        win.webContents.openDevTools()
        win.loadURL('http://localhost:'+port)
    }else{
        win.loadFile('dist/index.html')
    }
    
    
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady().then(createWindow)