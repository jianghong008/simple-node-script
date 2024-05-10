import * as PIXI from 'pixi.js';
import { EventType, GEvent } from './core/utils/GEvent';
import { DataBus } from './core/utils/DataBus';
import { MainUi } from './core/ui/MainUi';

export class Stage {
    public app: PIXI.Application;
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
            GEvent.emit(EventType.PointerDown, e, this)
        }
        this.app.canvas.onpointerup = (e) => {
            GEvent.emit(EventType.PointerUp, e, this)
        }
        this.app.canvas.onpointermove = (e) => {
            GEvent.emit(EventType.PointerMove, e, this)
        }
        this.app.canvas.onpointerenter = (e) => {
            GEvent.emit(EventType.PointerEnter, e, this)
        }
        this.app.canvas.onpointerout = (e) => {
            GEvent.emit(EventType.PointerOut, e, this)
        }
        this.app.canvas.onpointercancel = (e) => {
            GEvent.emit(EventType.PointerCancel, e, this)
        }
    }
    async init() {
        this.intEvents()
        this.app.ticker.add(this.update.bind(this)) 
    }
    update() {
        DataBus.nodes.forEach(node => {
            node.update()
        })
    }
}