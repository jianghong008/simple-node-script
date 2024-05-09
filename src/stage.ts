import * as PIXI from 'pixi.js';
import { BaseNode } from './core/nodes/BaseNode';
import { EventType, GEvent } from './core/utils/GEvent';

export class Stage {
    private _app: PIXI.Application;
    public nodes: BaseNode[] = []
    constructor(div: HTMLDivElement) {
        const rect = div.getBoundingClientRect();
        this._app = new PIXI.Application()
        this._app.init({
            width: rect.width,
            height: rect.height,
            antialias: true,
        }).then(() => {
            div.appendChild(this._app.canvas)
            this.init()
        })
    }
    intEvents() {
        this._app.canvas.onpointerdown = (e) => {
            GEvent.emit(EventType.PointerDown, e, this)
        }
        this._app.canvas.onpointerup = (e) => {
            GEvent.emit(EventType.PointerUp, e, this)
        }
        this._app.canvas.onpointermove = (e) => {
            GEvent.emit(EventType.PointerMove, e, this)
        }
        this._app.canvas.onpointerenter = (e) => {
            GEvent.emit(EventType.PointerEnter, e, this)
        }
        this._app.canvas.onpointerout = (e) => {
            GEvent.emit(EventType.PointerOut, e, this)
        }
        this._app.canvas.onpointercancel = (e) => {
            GEvent.emit(EventType.PointerCancel, e, this)
        }
    }
    async init() {
        this.intEvents()
        const node1 = new BaseNode()
        node1.addInput({ input: 'input1' })
        node1.addOutput({ output: 'output1' })
        node1.addOutput({ output: 'output2' })
        node1.addOutput({ output: 'output3' })
        const node2 = new BaseNode()
        node2.addInput({ input: 'input1' })
        node2.addInput({ input: 'input2' })
        node2.addInput({ input: 'input3' })
        node2.addInput({ input: 'input3' })
        node2.addInput({ input: 'input3output3input3' })
        node2.addOutput({ output: 'output1' })
        this.nodes.push(node1, node2)
        this._app.stage.addChild(node1.view, node2.view)
    }
}