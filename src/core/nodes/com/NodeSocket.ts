import { Stage } from "../../../stage";
import { DataBus } from "../../utils/DataBus";
import { EventType, GEvent } from "../../utils/GEvent";
import { BaseNode } from "../BaseNode"
import * as PIXI from 'pixi.js';

export class NodeSocket {
    public key: string
    public connection?: SocketConnection
    public view: PIXI.Graphics
    public parent: BaseNode
    public isActive = false
    public type: 'input' | 'output' = 'input'
    public isBussing = false
    private pointer = {
        down: false,
        x: 0,
        y: 0,
    }
    constructor(key: string, node: BaseNode, x: number, y: number) {
        this.key = key
        this.parent = node
        this.view = new PIXI.Graphics()
        this.view.y = y
        this.view.x = x
        this.view.label = NodeSocket.name
        this.rerender()
        this.initEvents()

    }
    get x() {
        return this.view.x
    }
    set x(v) {
        this.view.x = v
    }
    get y() {
        return this.view.y
    }
    set y(v) {
        this.view.y = v
    }
    private initEvents() {
        this.view.interactive = true;
        this.view.onpointerdown = this.onpointerdown.bind(this)
        GEvent.on(EventType.PointerUp, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerOut, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerCancel, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerMove, this.onpointermove.bind(this))
    }
    private onpointermove(e: PIXI.FederatedPointerEvent, _stage: Stage) {
        if (!this.pointer.down) {
            return
        }
        this.active()
        this.view.beginPath()
        this.view.moveTo(5, 5)
        let end = { x: e.x, y: e.y }
        end = this.view.toLocal(end)
        this.view.lineTo(end.x, end.y)
        this.view.stroke({ color: 0xf86d62, width: 4 })

        const socket = this.checkAdsorption(e.x, e.y, DataBus.nodes)
        if (socket) {
            socket.active()
        }
    }
    private checkAdsorption(x: number, y: number, nodes: BaseNode[]) {
        const pos = new PIXI.Point(x, y)
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]
            if (node === this.parent) {
                continue
            }
            const sockets = this.type === 'output' ? node.inputs : node.outputs

            for (let j = 0; j < sockets.length; j++) {
                const socket = sockets[j].socket
                if (!socket) {
                    continue
                }
                if (socket.isBussing) {
                    continue
                }
                const end = socket.view.toGlobal(new PIXI.Point(0, 0))
                const distance = Math.sqrt(Math.pow(pos.x - end.x, 2) + Math.pow(pos.y - end.y, 2))

                if (distance < socket.view.width / 2) {
                    return socket
                } else {
                    socket.rerender()
                }
            }
        }
    }
    private adsorp(socket: NodeSocket) {
        if (socket.isBussing) {
            return
        }
        this.connection = {
            node: socket.parent.id,
            socket: socket.key
        }
        socket.isBussing = true
        socket.connection = {
            node: this.parent.id,
            socket: this.key
        }
        this.parent.updateSocket(this)

        this.parent.onConnect?.call(this, this, socket)
        socket.parent.onConnect?.call(this, this, socket)
    }

    public disconnect() {
        const node = DataBus.nodes.find(node => node.id === this.connection?.node)
        if (!node) {
            return
        }
        let socket: NodeSocket | undefined
        if (this.type === 'output') {
            const input = node.inputs.find(input => input.socket?.key === this.connection?.socket)
            socket = input?.socket
        } else {
            const output = node.outputs.find(output => output.socket?.key === this.connection?.socket)
            socket = output?.socket
        }
        if (socket) {
            socket.isBussing = false
            socket.connection = undefined
        }
        this.connection = undefined
        this.parent.updateSocket(this)
    }

    private connectSocket(socket?: NodeSocket) {
        if (!socket) {
            return
        }
        this.rerender()
        this.view.beginPath()
        this.view.moveTo(5, 5)
        let end = socket.view.toGlobal(new PIXI.Point(0, 0))
        end = this.view.toLocal(end)
        end.x += 5
        end.y += 5
        let lineWidth = Math.abs(end.x - 5) > 50 ? 50 : 0
        if(Math.abs(end.y - 5) > 50){
            lineWidth = 80
        }
        
        if(lineWidth === 0){
            this.view.lineTo(end.x, end.y)
        }else{
            const c1 = new PIXI.Point(lineWidth, 20)
            const c2 = new PIXI.Point(end.x - lineWidth, end.y - 20)
            this.view.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, end.x, end.y)
        }
        this.view.stroke({ color: 0xffffff, width: 4 })

        socket.connection = {
            node: this.parent.id,
            socket: this.key
        }
        socket.isBussing = true
    }

    chechConnection() {
        if (this.isActive) {
            return
        }
        if (!this.connection) {
            return
        }
        const node = DataBus.nodes.find(node => node.id === this.connection?.node)
        if (!node) {
            return
        }
        let socket: NodeSocket | undefined
        if (this.type === 'output') {
            const input = node.inputs.find(input => input.socket?.key === this.connection?.socket)
            socket = input?.socket
        }
        this.connectSocket(socket)
    }

    private stagePointerOut(e: PIXI.FederatedPointerEvent, _stage: Stage) {
        this.parent.view.zIndex = 0
        if (this.pointer.down) {
            const socket = this.checkAdsorption(e.x, e.y, DataBus.nodes)
            if (socket) {
                this.adsorp(socket)
            } else {
                this.disconnect()
            }
            this.isActive = false
        }
        this.pointer.down = false
        this.rerender()
    }
    private onpointerdown(e: PIXI.FederatedPointerEvent) {
        if (this.type === 'input') {
            return
        }
        this.disconnect()
        this.pointer.down = true
        this.pointer.x = e.globalX
        this.pointer.y = e.globalY
        this.parent.view.zIndex = 100
        this.isActive = true
    }

    rerender() {
        this.view.clear()
        this.view.beginPath()
        this.view.arc(0, 5, 10, 0, 2 * Math.PI);
        this.view.fill(0xffffff);
        if (this.connection) {
            this.view.stroke(0xff0000);
        }

    }

    active() {
        this.view.clear()
        this.view.beginPath()
        this.view.arc(0, 5, 10, 0, 2 * Math.PI);
        this.view.fill(0xf86d62);
    }
}