import { BuiltInFunc } from "./BuiltInFunc";
import * as PIXI from 'pixi.js';
export class PrintNode extends BuiltInFunc {

    private body: PIXI.Container
    constructor(name?: string) {
        super(name ? name : 'Print');
        this.body = new PIXI.Container()
        this.customBox.addChild(this.body)
        this.funcName = 'print';
        this.addInput({ key: 'input' })
        this.refresh()
    }

}