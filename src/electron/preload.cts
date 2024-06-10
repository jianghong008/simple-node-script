import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('compiler', {
    execute,
    onExecuteMessage,
    onExecuteDone,
    resizeEditor,
})

contextBridge.exposeInMainWorld('editor', {
    openFile,
    saveFile,
})

function execute(code: string) {
    ipcRenderer.invoke('execute', code)
}

function onExecuteMessage(callback: (msg: string) => void) {
    ipcRenderer.on('onExecuteMessage', (_event, value) => callback(value))
}

function onExecuteDone(callback: () => void) {
    ipcRenderer.on('onExecuteDone', (_event) => callback())
}

function resizeEditor(callback: () => void) {
    ipcRenderer.on('resizeEditor', () => callback())
}

function openFile(title: string) {
    return ipcRenderer.invoke('openFile',title)
}

function saveFile(title: string, code: string,t:string='json') {
    ipcRenderer.invoke('saveFile', title, code,t)
}