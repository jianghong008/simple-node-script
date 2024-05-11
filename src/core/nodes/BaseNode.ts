import * as PIXI from 'pixi.js';
import { EventType, GEvent } from '../utils/GEvent';
import { NodeSocket } from './NodeSocket';
interface SocketObject {
    key: string
    socket?: NodeSocket
    parms?: {
        node: string
        socket: string
    }
}
export class BaseNode {
    public id = ''
    public title: PIXI.Text
    public view: PIXI.Container
    public width = 180
    public background: PIXI.Graphics
    private content: PIXI.Container
    private outputBox: PIXI.Container
    private inputsBox: PIXI.Container
    public boxRadius = 2
    public outputName = 'output'
    public edit = {
        out: false,
    }
    private dragging = {
        x: 0,
        y: 0,
        isDragging: false
    }
    public padding = 5
    private _outputs: SocketObject[] = []
    private _inputs: SocketObject[] = []
    public titleContent = ''
    constructor(title = 'node') {
        this.titleContent = title
        this.createID()
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

        this.outputBox = new PIXI.Container({ x: this.width/2-this.padding, y: this.padding });
        this.outputBox.width = this.width/2
        this.content.addChild(this.outputBox);
        this.inputsBox = new PIXI.Container({ x: 10, y: this.padding });
        this.inputsBox.width = this.width/2
        this.content.addChild(this.inputsBox);

        this.createView();
        this.rerender()
    }
    private createID() {
        const date = (Date.now() + Math.floor(Math.random() * 10000)).toString(16)
        const id = `node_${this.titleContent}_${date}`
        this.id = id
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
    update() {
        this._inputs.forEach(input => {
            input.socket?.chechConnection()
        })
        this._outputs.forEach(output => {
            output.socket?.chechConnection()
        })
    }
    refresh() {
        this.createInputs()
        this.createOutputs()
    }
    private onpointerup() {
        this.view.cursor = 'default'
    }
    private onpointerout() {
        this.view.cursor = 'default'
        this.background.clear()
        this.background.roundRect(0, 0, this.width, 100, this.boxRadius);
        this.background.fill('#6e88ff');
        this.background.stroke('#4e58bf')
        this.view.zIndex = 0
    }
    private onpointerdown(e: PIXI.FederatedPointerEvent) {
        const target = e.target as any
        if (target && target.label === 'NodeSocket') {
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
        this.background.roundRect(0, 0, this.width, 100, this.boxRadius);
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
        this.background.roundRect(0, 0, this.width, 100, this.boxRadius);
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
        this.background.height = 0
        const rect = this.view.getBounds()
        this.content.x = this.padding
        this.content.y = this.padding
        // this.content.width = rect.width - 2 * this.padding
        this.background.height = rect.height + 2 * this.padding
    }

    addOutput(output: SocketObject) {
        this._outputs.push(output)
        this.createOutputs()
    }

    addInput(input: SocketObject) {
        this._inputs.push(input)
        this.createInputs()
    }

    updateSocket(socket: NodeSocket) {
        const ar = socket.type === 'input' ? this._inputs : this._outputs
        const socketObj = ar.find(item => item.socket?.key === socket.key)
        if (!socketObj) {
            return
        }
        socketObj.parms = socket.connection

    }

    private createInputs() {
        this.inputsBox.removeChildren();
        const top = this.title.getBounds().height + this.padding / 2
        for (let i = 0; i < this._inputs.length; i++) {
            const input = this._inputs[i];
            const y = this.padding + 20 * i * 1.5 + top
            const text = new PIXI.Text({
                text: input.key,
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
            input.socket = new NodeSocket(input.key, this, -this.padding - 10, y)
            if (input.parms) {
                input.socket.connection = input.parms
            }
            this.inputsBox.addChild(input.socket.view);
            this.inputsBox.addChild(text);
        }
        this.rerender()
    }

    private createOutputs() {
        const top = this.title.getBounds().height + this.padding / 2
        this.outputBox.removeChildren();
        const x = this.width / 2 - this.padding/2
        for (let i = 0; i < this._outputs.length; i++) {
            const output = this._outputs[i];
            const y = this.padding + 20 * i * 1.5 + top
            const text = new PIXI.Text({
                text: output.key,
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

            output.socket = new NodeSocket(output.key, this, x, y)
            if (output.parms) {
                output.socket.connection = output.parms
            }
            output.socket.type = 'output'
            this.outputBox.addChild(output.socket.view);
            this.outputBox.addChild(text);

            this.createOutputRemoveAction(x - 30, y + 5, output.key)

        }
        const y = this.padding + 20 * this._outputs.length * 1.5 + top
        this.createOutputAddAction(x - 10, y)
        this.rerender()
    }

    private createOutputAddAction(x: number, y: number) {
        if (!this.edit.out) {
            return
        }
        const btn = new PIXI.Graphics({ x, y });
        const padding = 2
        btn.arc(0, 0, 10, 0, 2 * Math.PI);
        btn.fill(0x22aa62);
        btn.beginPath()
        btn.moveTo(-10 + padding, 0)
        btn.lineTo(10 - padding, 0)
        btn.stroke({ color: 0xffffff, width: 4 })
        btn.beginPath()
        btn.moveTo(0, -10 + padding)
        btn.lineTo(0, 10 - padding)
        btn.stroke({ color: 0xffffff, width: 4 })
        this.outputBox.addChild(btn);

        btn.cursor = 'pointer'
        btn.interactive = true
        btn.onpointertap = this.onAddOutput.bind(this)
    }

    private onAddOutput() {
        this.addOutput({ key: this.outputName + (this._outputs.length + 1) })
    }

    private createOutputRemoveAction(x: number, y: number, key: string) {
        if (!this.edit.out) {
            return
        }
        const btn = new PIXI.Graphics({ x, y });
        const padding = 2
        btn.arc(0, 0, 10, 0, 2 * Math.PI);
        btn.fill(0xaa0062);
        btn.beginPath()
        btn.moveTo(-10 + padding, 0)
        btn.lineTo(10 - padding, 0)
        btn.stroke({ color: 0xffffff, width: 4 })
        this.outputBox.addChild(btn);

        btn.cursor = 'pointer'
        btn.interactive = true
        btn.onpointertap = () => {
            this.onRemoveOutput(key)
        }
    }

    private onRemoveOutput(key: string) {
        const index = this._outputs.findIndex(v => v.key === key)
        if (index > -1) {
            this._outputs.splice(index, 1)
            this.createOutputs()
            
        }
    }
}