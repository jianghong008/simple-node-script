/// <reference types="vite/client" />

interface Compiler{
    execute(tokens: SvnToken[]): void
    onMessage(e: MessageEvent): void
}

interface Window{
    compiler: Compiler
}