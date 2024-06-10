import { app, BrowserWindow, ipcMain,dialog } from 'electron'
import path from 'path'
import {spawn} from 'child_process'
import { readFileSync, writeFileSync } from 'original-fs'
let win:BrowserWindow|null = null
function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(app.getAppPath(), 'out/preload.cjs'),
        },
        icon: path.join(app.getAppPath(), 'public/sgs-ico.ico'),
    })
    win.removeMenu()
    if (process.env.NODE_ENV === 'development') {
        const port = process.argv[2] ?? '5173'
        win.webContents.openDevTools()
        win.loadURL('http://localhost:' + port)
    } else {
        win.loadFile(path.join(app.getAppPath(), 'dist/index.html'))
    }
    // win.webContents.openDevTools()
    // win.loadFile(path.join(app.getAppPath(), 'dist/index.html'))

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
    ipcMain.handle('saveFile', async (e,title,data,t) => {
        saveFile(e,title,data,t)
    })

    ipcMain.handle('openFile', async (_,title) => {
        return openFile(title)
    })
}

async function execute(e:Electron.IpcMainInvokeEvent,token: any[]) {
    const vmPath = path.join(app.getAppPath(), 'bin/sgs-vm.exe')
    const tempPath = path.join(app.getAppPath(), 'data/temp.sgs')
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
        e.senderFrame.send('onExecuteDone','done')
    })
}

function resizeEditot() {
    win?.webContents.send('resizeEditor')
}

async function saveFile(e:Electron.IpcMainInvokeEvent,title:string,code: string,t:string='json') {
    const tempPath = path.join(app.getAppPath(), 'data/my-script.'+t)
    const {filePath} = await dialog.showSaveDialog({
        title: title,
        defaultPath: tempPath,
        filters: [
            { name: 'script', extensions: [t] }
        ]
    })
    if(filePath){
        writeFileSync(filePath,code)
        e.sender.send('onSaveFile',filePath)
    }
}

async function openFile(title:string) {
    const {filePaths} = await dialog.showOpenDialog({
        title: title,
        filters: [
            { name: 'script', extensions: ['json'] }
        ]
    })
    if(filePaths[0]){
        const data = readFileSync(filePaths[0]).toString('utf-8')
        return data
    }else{
        return ''
    }
}