import * as PIXI from 'pixi.js';
import { BaseNode } from './core/nodes/BaseNode';

export class Stage {
    private _app: PIXI.Application;
    constructor(div: HTMLDivElement) {
        const rect = div.getBoundingClientRect();
        this._app = new PIXI.Application()
        this._app.init({
            width:rect.width,
            height:rect.height,
        }).then(() => {
            div.appendChild(this._app.canvas)
            this.init()
        })
    }
    async init(){
        const node1 = new BaseNode()
        const node2 = new BaseNode()
        node2.addOutput({output:'output1'})
        node2.addOutput({output:'output2'})
        node2.addOutput({output:'output3'})
        node2.addOutput({output:'output3'})
        node2.addOutput({output:'output3'})
        this._app.stage.addChild(node1.view,node2.view)
    }
}