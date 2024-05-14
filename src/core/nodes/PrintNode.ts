import { BuiltInFunc } from "./BuiltInFunc";
import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
export class PrintNode extends BuiltInFunc {
    private logBox: UI.ScrollBox
    private body: PIXI.Container
    constructor(name?: string) {
        super(name ? name : 'Print');
        this.body = new PIXI.Container()
        this.customBox.addChild(this.body)
        this.funcName = 'print';
        this.addInput({ key: 'input' })
        this.logBox = new UI.ScrollBox({
            background: 0X111122,
            width: this.width - this.customBox.x * 2 - this.padding * 2,
            height: 200,
            elementsMargin: 5,
            globalScroll: false
        })

        this.createBtn()
        this.logBox.y = 60
        this.body.addChild(this.logBox)
        this.refresh()
    }
    private createBtn() {
        const btn = new UI.Button(new PIXI.Text({
            text: 'clear',
            style: {
                fontSize: 16,
                fill: 0xffdd99,
                fontWeight: 'bold'
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
        this.logBox.scrollTo(0)
    }
    print(msg: any) {
        const box = new PIXI.Container()
        const g = new PIXI.Graphics()
        g.rect(0, 0, this.logBox.width, 20)
        g.fill(0x221133)
        box.addChild(g)
        box.addChild(new PIXI.Text({
            text: String(msg),
            style: {
                fontSize: 12,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: this.logBox.width,
                breakWords: true
            }
        }))

        this.logBox.addItem(box)
    }
}