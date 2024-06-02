import { SvnToken } from "../svm/VM"
import { postData } from "./api"

export enum CompilerStatus {
    Running,
    Stop,
    Ready,
}
export enum CompilerCmd {
    Compile = 'compile',
}
export enum CompilerResult {
    Compiled = 'compiled',
    Error = 'error',
    Log = 'log'
}
export interface CompilerData {
    data: SvnToken[]
    cmd: CompilerCmd
}
export interface CompilerResultData {
    cmd: CompilerResult
    data: any
}
export class Compiler {
    public ws?: WebSocket
    public status = CompilerStatus.Stop
    private wsConnected = false
    init(){
        this.ws = new WebSocket('ws://127.0.0.1:8091')
        this.ws.onmessage = this.onWsMessage.bind(this)
        this.ws.onopen = this.onWsOpen.bind(this)
        this.ws.onclose = this.onWsClose.bind(this)
        this.ws.onerror = this.onWsError.bind(this)
    }
    private onWsOpen() {
        this.status = CompilerStatus.Ready
        this.wsConnected = true
        console.log('ws open')
    }
    private onWsClose() {
        this.status = CompilerStatus.Stop
        this.wsConnected = false
        console.log('ws close')
    }
    private onWsError() {
        this.status = CompilerStatus.Stop
        this.wsConnected = false
        console.log('ws err')
    }
    private onWsMessage(e: MessageEvent) {
        try {
            const data: CompilerResultData = JSON.parse(e.data)
            if(data.cmd==='compiled'){
                this.status = CompilerStatus.Stop
            }
        } catch (_e) {
            console.log(e.data)
        }
    }

    public execute(tokens: SvnToken[]) {
        // if (!this.wsConnected) {
        //     throw new Error('ws not connected')
        // }
        const data: CompilerData = {
            data:tokens,
            cmd: CompilerCmd.Compile
        }
        // this.status = CompilerStatus.Running
        // this.ws?.send(JSON.stringify(data))

        postData('http://127.0.0.1:8090/compile', data)
    }
}