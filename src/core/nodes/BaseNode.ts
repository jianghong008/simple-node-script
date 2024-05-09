import * as PIXI from 'pixi.js';
import { EventType, GEvent } from '../utils/GEvent';
import { NodeSocket } from './NodeSocket';
interface OutputObject {
    node?: BaseNode
    output: string
    socket?: NodeSocket
}
interface InputObject {
    node?: BaseNode
    input: string
    socket?: NodeSocket
}
export class BaseNode {
    public title: PIXI.Text
    public view: PIXI.Container
    public width = 180
    public background: PIXI.Graphics
    private content: PIXI.Container
    private outputBox: PIXI.Container
    private inputsBox: PIXI.Container
    private dragging = {
        x: 0,
        y: 0,
        isDragging: false
    }
    public padding = 5
    private _outputs: OutputObject[] = []
    private _inputs: InputObject[] = []
    constructor(title = 'node') {
        this.view = new PIXI.Container();
        this.view.label = BaseNode.name
        this.content = new PIXI.Container({ x: this.padding, y: this.padding });
        this.background = new PIXI.Graphics()
        this.view.addChild(this.background);
        this.view.addChild(this.content);
        this.title = new PIXI.Text({
            text: title,
            style: {
                fontSize: 18,
                fill: 0xffffff,
                wordWrap: true,
                wordWrapWidth: 160,
                fontWeight: 'bold'
            }
        });
        this.content.addChild(this.title);

        this.outputBox = new PIXI.Container({ x: 90, y: this.padding });
        this.content.addChild(this.outputBox);
        this.inputsBox = new PIXI.Container({ x: 10, y: this.padding });
        this.content.addChild(this.inputsBox);

        this.createView();
        this.rerender()

        this.createOutputs()
    }
    get outputs() {
        return this._outputs
    }
    get inputs() {
        return this._inputs
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
    private onpointerup() {
        this.view.cursor = 'default'
    }
    private onpointerout() {
        this.view.cursor = 'default'
        this.background.clear()
        this.background.roundRect(0, 0, this.width, 100, 10);
        this.background.fill('#6e88ff');
        this.background.stroke('#4e58bf')
        this.view.zIndex = 0
    }
    private onpointerdown(e: PIXI.FederatedPointerEvent) {
        const target = e.target as any
        if(target && target.label==='NodeSocket'){
            return
        }
        this.dragging.isDragging = true
        this.dragging.x = e.clientX
        this.dragging.y = e.clientY
        this.view.zIndex = 100
    }
    private onpointermove(e: PIXI.FederatedPointerEvent) {
        if (this.dragging.isDragging) {
            this.view.cursor = 'grabbing'
            this.x += e.movementX
            this.y += e.movementY
        }
    }
    private onpointerenter() {
        this.background.clear()
        this.background.roundRect(0, 0, this.width, 100, 10);
        this.background.fill('#6e88ff');
        this.background.stroke({ color: '#bdc421', width: 1 })
    }
    private stagePointerOut() {
        this.dragging.isDragging = false
    }
    private initEvents() {
        GEvent.on(EventType.PointerUp, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerOut, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerCancel, this.stagePointerOut.bind(this))
        GEvent.on(EventType.PointerMove, this.onpointermove.bind(this))
    }
    private createView() {
        this.background.roundRect(0, 0, this.width, 100, 10);
        this.background.fill('#6e88ff');
        this.background.stroke('#4e58bf')
        this.view.interactive = true;
        this.view.onpointerenter = this.onpointerenter.bind(this)
        this.view.onpointerdown = this.onpointerdown.bind(this)
        this.view.onpointerup = this.onpointerup.bind(this)
        this.view.onpointerout = this.onpointerout.bind(this)
     
        this.initEvents()
    }

    private rerender() {
        const rect = this.view.getLocalBounds();
        this.content.x = this.padding
        this.content.y = this.padding
        // this.content.width = rect.width - 2 * this.padding
        this.background.height = rect.height + 2 * this.padding
    }

    addOutput(output: OutputObject) {
        this._outputs.push(output)
        this.createOutputs()
    }

    addInput(input: InputObject) {
        this._inputs.push(input)
        this.createInputs()
    }

    private createInputs() {
        this.inputsBox.removeChildren();
        const top = this.title.getBounds().height + this.padding / 2
        for (let i = 0; i < this._inputs.length; i++) {
            const input = this._inputs[i];
            const y = this.padding + 20 * i * 1.5 + top
            const text = new PIXI.Text({
                text: input.input,
                style: {
                    fontSize: 16,
                    fill: 0xffffff,
                    wordWrap: false,
                    wordWrapWidth: 60,
                    trim: true
                }
            })

            text.y = y
            const textRect = text.getLocalBounds();
            if (textRect.width > 60) {
                const mask = new PIXI.Graphics();
                mask.rect(0, y, 60, 16);
                mask.fill(0x000000);
                this.inputsBox.addChild(mask);
                text.mask = mask
                const more = new PIXI.Text({
                    text: '...',
                    style: {
                        fontSize: 16,
                        fill: 0xffffff,
                        trim: true
                    }
                })
                more.y = y + 8
                more.x = 62
                this.inputsBox.addChild(more);
            }
            input.socket = new NodeSocket(input.input, this, -this.padding - 10, y)

            this.inputsBox.addChild(input.socket.view);
            this.inputsBox.addChild(text);
        }
        this.rerender()
    }

    private createOutputs() {
        const top = this.title.getBounds().height + this.padding / 2
        this.outputBox.removeChildren();
        const x = this.view.width / 2 - this.padding / 2
        for (let i = 0; i < this._outputs.length; i++) {
            const output = this._outputs[i];
            const y = this.padding + 20 * i * 1.5 + top
            const text = new PIXI.Text({
                text: output.output,
                style: {
                    fontSize: 16,
                    fill: 0xffffff,
                    wordWrap: false,
                    wordWrapWidth: 60,
                    trim: true
                }
            })

            text.y = y
            const textRect = text.getLocalBounds();
            if (textRect.width > 60) {
                const mask = new PIXI.Graphics();
                mask.rect(0, y, 60, 16);
                mask.fill(0x000000);
                this.outputBox.addChild(mask);
                text.mask = mask
                const more = new PIXI.Text({
                    text: '...',
                    style: {
                        fontSize: 16,
                        fill: 0xffffff,
                        trim: true
                    }
                })
                more.y = y + 8
                more.x = 62
                this.outputBox.addChild(more);
            }

            output.socket = new NodeSocket(output.output, this, x-5, y)
            output.socket.type = 'output'
            this.outputBox.addChild(output.socket.view);
            this.outputBox.addChild(text);
        }
        this.rerender()
    }
}