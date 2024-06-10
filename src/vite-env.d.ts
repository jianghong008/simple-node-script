/// <reference types="vite/client" />

interface Compiler{
    execute(tokens: SvnToken[]): void
    onExecuteMessage(callback: (msg:string)=>void): void
    onExecuteDone(callback:()=>void): void
    resizeEditor(callback:()=>void):void
}

interface Editor{
    openFile: (title:string) => Promise<string>
    saveFile: (title:string,code:string,t='json') => void
}

interface Window{
    compiler: Compiler
    editor: Editor
}