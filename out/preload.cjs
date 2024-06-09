"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('compiler', {
    execute,
    onExecuteMessage,
    onExecuteDone,
    resizeEditor,
});
electron_1.contextBridge.exposeInMainWorld('editor', {
    openFile,
    saveFile,
});
function execute(tokens) {
    electron_1.ipcRenderer.invoke('execute', tokens);
}
function onExecuteMessage(callback) {
    electron_1.ipcRenderer.on('onExecuteMessage', (_event, value) => callback(value));
}
function onExecuteDone(callback) {
    electron_1.ipcRenderer.on('onExecuteDone', (_event) => callback());
}
function resizeEditor(callback) {
    electron_1.ipcRenderer.on('resizeEditor', () => callback());
}
function openFile() {
}
function saveFile() {
}
