/// <reference types="vite/client" />

interface Compiler{
    execute(tokens: SvnToken[]): void
    onExecuteMessage(callback: (msg:string)=>void): void
    onExecuteDone(callback:()=>void): void
    resizeEditor(callback:()=>void):void
}

interface Window{
    compiler: Compiler
}