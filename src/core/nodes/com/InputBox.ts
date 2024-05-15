import * as PIXI from 'pixi.js';
import { DataBus } from '../../utils/DataBus';
export class InputBox extends PIXI.Container {
    private input: PIXI.Text
    private bg: PIXI.Graphics
    public onChange?: (value: string) => void
    constructor(x: number, y: number, w: number, h: number, txt: string) {
        super({ x, y });
        this.input = new PIXI.Text({
            text: txt,
            style: {
                fontSize: 16,
                fill: 0xffffff,
                align: 'center',
            }
        })

        this.bg = new PIXI.Graphics()
        this.bg.roundRect(0, 0, w, h, 5)
        this.bg.fill(0x3f51b5)
        const mask = new PIXI.Graphics()
        mask.roundRect(0, 0, w, h, 5)
        mask.fill(0x3f51b5)
        this.input.mask = mask
        this.addChild(this.bg, mask, this.input)

        this.init()
    }

    get value() {
        return DataBus.input.value
    }

    private init() {
        this.interactive = true
        this.cursor = 'text'

        this.onpointertap = () => {
            DataBus.input.value = this.input.text
            this.input.visible = false
            DataBus.input.style.display = 'block'
            DataBus.input.style.fontSize = (16 * DataBus.nodesBox.scale.x) + 'px'
            const pos = this.toGlobal({x:0,y:0})
            DataBus.input.style.left = (pos.x) + 'px'
            DataBus.input.style.top = (pos.y) + 'px'
            DataBus.input.style.width = (this.width * DataBus.nodesBox.scale.x) + 'px'
            DataBus.input.oninput = this.onInput.bind(this)
            DataBus.input.onblur = this.onBlur.bind(this)
            DataBus.input.onchange = ()=>{
                this.onChange?.call(this,DataBus.input.value)
            }
            DataBus.input.focus()
        }
    }

    private onInput() {
        this.input.text = DataBus.input.value
    }

    private onBlur() {
        DataBus.input.value = ''
        DataBus.input.style.display = 'none'
        this.input.visible = true
    }
}