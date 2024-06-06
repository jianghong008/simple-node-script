import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { SvnToken } from '../core/svm/VM'
import {spawn} from 'child_process'
import { writeFileSync } from 'original-fs'
let win:BrowserWindow|null = null
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'out/preload.cjs'),
        }
    })
    win.webContents.openDevTools()
    win.removeMenu()
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
        const port = process.argv[2] ?? '5173'
        win.webContents.openDevTools()
        win.loadURL('http://localhost:' + port)
    } else {
        win.loadFile('dist/index.html')
    }
    win.webContents.on('did-finish-load', () => {
        win?.webContents.session.webRequest.onHeadersReceived((details, callback) => {
            callback({
                responseHeaders: {
                    ...details.responseHeaders,
                    'Content-Security-Policy': ["default-src 'self'"]
                }
            });
        });
    });

    win.on('maximize',resizeEditot)
    win.on('unmaximize',resizeEditot)
    win.on('show',resizeEditot)
    win.on('enter-full-screen',resizeEditot)
    win.on('leave-full-screen',resizeEditot)
    
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})
app.whenReady().then(onReady)

function onReady() {
    initEvents()
    createWindow()
}

function initEvents(){
    ipcMain.handle('execute', async (e,args) => {
        execute(e,args)
    })
}

async function execute(e:Electron.IpcMainInvokeEvent,token: SvnToken[]) {
    const vmPath = path.join(app.getAppPath(), 'bin/sgvm.exe')
    const tempPath = path.join(app.getAppPath(), 'data/temp.tp')
    const data = JSON.stringify(token)
    writeFileSync(tempPath,data)
    const vm = spawn(vmPath,[tempPath],{
        shell: true
    })
    vm.stdout.on('data', (data) => {
        const msg = data.toString()
        if(!msg){
            return
        }
        e.senderFrame.send('onExecuteMessage',msg)
    })
    vm.on('close',()=>{
        e.senderFrame.send('onExecuteDone')
        console.log('done')
    })
}

function resizeEditot() {
    win?.webContents.send('resizeEditor')
}