import { app, BrowserWindow,ipcMain } from 'electron'
import path,{dirname} from 'path'
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, './preload.cjs'),
        }
    })
    win.removeMenu()
    if (process.env.NODE_ENV === 'development'||process.env.NODE_ENV===undefined) {
        const port = process.argv[2] ?? '5173'
        win.webContents.openDevTools()
        win.loadURL('http://localhost:' + port)
    } else {
        win.loadFile('dist/index.html')
    }
    win.webContents.on('did-finish-load', () => {
        win.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ["default-src 'self'"]
                }
            });
        });
    });

}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.whenReady().then(onReady)

ipcMain.handle('execute', () => {
    return 123
})
function onReady(){
    
    createWindow()
}