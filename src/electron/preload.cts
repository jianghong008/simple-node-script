import { contextBridge,ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('compiler', {
    execute,
    onMessage,
})

contextBridge.exposeInMainWorld('editor', {
    openFile,
    saveFile,
})

function execute(tokens: any[]) {
    ipcRenderer.invoke('execute', tokens)
    console.log(tokens)
}

function onMessage(e: MessageEvent) {

}


function openFile() {

}

function saveFile() {
    
}