import { Stage } from "../../stage";
import { EventType, GEvent } from "../utils/GEvent";
import { BaseNode } from "./BaseNode"
import * as PIXI from 'pixi.js';
interface SocketConnection {
    node: BaseNode
    socket: NodeSocket
}
export class NodeSocket {
    public key: string
    public connection?: SocketConnection
    public view: PIXI.Graphics
    public parent: BaseNode
    public isActive = false
    public type: 'input' | 'output' = 'input'
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
    private onpointermove(e: PIXI.FederatedPointerEvent, stage: Stage) {
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

        const socket = this.checkAdsorption(e.x, e.y, stage.nodes)
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
    private adsorp(socket:NodeSocket) {
        this.connection = {
            node: socket.parent,
            socket: socket
        }
    }
    private stagePointerOut(e: PIXI.FederatedPointerEvent, stage: Stage) {
        this.parent.view.zIndex = 0
        if (this.pointer.down) {
            const socket = this.checkAdsorption(e.x, e.y, stage.nodes)
            if(socket){
                this.adsorp(socket)
            }
            
        }
        this.pointer.down = false
        this.rerender()
    }
    private onpointerdown(e: PIXI.FederatedPointerEvent) {
        this.pointer.down = true
        this.pointer.x = e.globalX
        this.pointer.y = e.globalY
        this.parent.view.zIndex = 100
    }

    rerender() {
        this.view.clear()
        this.view.beginPath()
        this.view.arc(0, 5, 10, 0, 2 * Math.PI);
        this.view.fill(0xffffff);
    }

    active() {
        this.view.clear()
        this.view.beginPath()
        this.view.arc(0, 5, 10, 0, 2 * Math.PI);
        this.view.fill(0xf86d62);
    }
}