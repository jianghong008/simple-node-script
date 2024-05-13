import { BuiltInFunc } from "./BuiltInFunc";
import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
export class PrintNode extends BuiltInFunc {
    private logBox: UI.ScrollBox
    private top = 0
    private body: PIXI.Container
    constructor(name?: string) {
        super(name ? name : 'Print');
        this.body = new PIXI.Container()
        this.customBox.addChild(this.body)
        this.funcName = 'print';
        this.addInput({ key: 'input' })
        this.logBox = new UI.ScrollBox({
            background: 0XFFFFFF,
            width: this.width - this.customBox.x * 2 - this.padding * 2,
            height: 200,
            elementsMargin:5,
        })

        this.createBtn()
        this.logBox.y = 30
        this.body.addChild(this.logBox)
        this.print('logs')
        this.refresh()
    }
    private createBtn() {
        const btn = new UI.Button(new PIXI.Text({
            text: 'clear',
            style: {
                fontSize: 16,
                fill: 0xff8899
            }
        }))
        const rect = btn.view.getBounds()
        btn.view.x = this.width - this.customBox.x * 2 - this.padding * 2 - rect.width
        btn.onPress.connect(() => {
            this.clear()
        })
        this.body.addChild(btn.view)
    }
    clear() {
        this.logBox.removeItems()
    }
    print(msg: any) {
        const text = new PIXI.Text({
            text: String(msg),
            style: {
                fontSize: 16,
                fill: 0x000000,
                wordWrap: true,
                wordWrapWidth: this.logBox.width,
                breakWords: true
            }
        })
        
        this.logBox.addItem(text)
        if (this.top == 0) {
            const rect = this.inputsBox.getBounds()
            this.top = rect.height + rect.y
        }
        this.body.y = this.top
        this.rerender()
    }
}