import * as PIXI from 'pixi.js';
import { EventType, GEvent } from './core/utils/GEvent';
import { DataBus } from './core/utils/DataBus';
import { MainUi } from './core/ui/MainUi';
import { MainNode } from './core/nodes/MainNode';

export class Stage {
    public app: PIXI.Application;
    private stagePointer = {
        down: false,
    }
    constructor(div: HTMLDivElement) {
        const rect = div.getBoundingClientRect();
        this.app = new PIXI.Application()
        DataBus.app = this.app
        this.app.init({
            width: rect.width,
            height: rect.height,
            antialias: true,
        }).then(() => {
            div.appendChild(this.app.canvas)
            DataBus.nodesBox = new PIXI.Container()
            this.app.stage.addChild(DataBus.nodesBox)
            DataBus.ui = new MainUi()
            this.init()
            this.app.stage.addChild(DataBus.ui.view)
        })
    }
    intEvents() {
        this.app.canvas.onpointerdown = (e) => {
            e.stopPropagation()
            GEvent.emit(EventType.PointerDown, e, this)
            if(e.button === 1){
                DataBus.nodesBox.cursor = 'grabbing'
                this.stagePointer.down = true
            }
            
        }
        this.app.canvas.onpointerup = (e) => {
            this.stagePointer.down = false
            DataBus.nodesBox.cursor = 'default'
            GEvent.emit(EventType.PointerUp, e, this)
        }
        this.app.canvas.onpointermove = (e) => {
            this.onStagePointerMove(e)
            GEvent.emit(EventType.PointerMove, e, this)
        }
        this.app.canvas.onpointerenter = (e) => {
            GEvent.emit(EventType.PointerEnter, e, this)
        }
        this.app.canvas.onpointerout = (e) => {
            this.stagePointer.down = false
            DataBus.nodesBox.cursor = 'default'
            GEvent.emit(EventType.PointerOut, e, this)
        }
        this.app.canvas.onpointercancel = (e) => {
            DataBus.nodesBox.cursor = 'default'
            GEvent.emit(EventType.PointerCancel, e, this)
        }

        this.app.canvas.oncontextmenu = (e) => {
            e.preventDefault()
        }
    }
    private onStagePointerMove(e: PointerEvent) {
        if (!this.stagePointer.down) {
            return
        }
        DataBus.nodesBox.x += e.movementX
        DataBus.nodesBox.y += e.movementY
    }
    async init() {
        this.intEvents()
        this.app.ticker.add(this.update.bind(this))

        //base node
        const main = new MainNode()
        main.center()
        DataBus.nodes.push(main)
        DataBus.nodesBox.addChild(main.view)
    }
    update() {
        DataBus.nodes.forEach(node => {
            node.update()
        })
    }
}