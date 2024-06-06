import { contextBridge,ipcRenderer } from 'electron'

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

function execute(tokens: any[]) {
    ipcRenderer.invoke('execute', tokens)
}

function onExecuteMessage(callback:(msg:string)=>void) {
    ipcRenderer.on('onExecuteMessage', (_event, value) => callback(value))
}

function onExecuteDone(callback:()=>void) {
    ipcRenderer.on('onExecuteDone', (_event) => callback())
}

function resizeEditor(callback:()=>void) {
    ipcRenderer.on('resizeEditor',()=>callback())
}

function openFile() {

}

function saveFile() {
    
}