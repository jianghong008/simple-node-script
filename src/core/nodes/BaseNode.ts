import * as PIXI from 'pixi.js';
import { EventType, GEvent } from '../utils/GEvent';
import { NodeSocket } from './NodeSocket';
import { Input, Select } from '@pixi/ui';
import { DataBus } from '../utils/DataBus';

export class BaseNode {
    public id = ''
    public title: PIXI.Text
    public view: PIXI.Container
    public width = 180
    public background: PIXI.Graphics
    private content: PIXI.Container
    private outputBox: PIXI.Container
    private inputsBox: PIXI.Container
    private attributesBox: PIXI.Container
    public boxRadius = 2
    public outputName = 'output'
    public type = 'node'
    public className = 'BaseNode'
    public edit = {
        out: false,
        delete: true
    }
    private dragging = {
        x: 0,
        y: 0,
        isDragging: false
    }
    public padding = 5
    private _outputs: SocketObject[] = []
    private _inputs: SocketObject[] = []
    private _attributes: NodeAttribute[] = []
    public titleContent = ''
    constructor(title = 'node') {
        this.className = this.constructor.name.replace('Node', '')
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

        this.attributesBox = new PIXI.Container({ x: 10, y: this.padding + 18 });
        this.content.addChild(this.attributesBox);

        this.outputBox = new PIXI.Container({ x: this.width / 2 - this.padding, y: this.padding });
        this.outputBox.width = this.width / 2
        this.content.addChild(this.outputBox);
        this.inputsBox = new PIXI.Container({ x: 10, y: this.padding });
        this.inputsBox.width = this.width / 2
        this.content.addChild(this.inputsBox);

        this.createView();
        this.rerender()
    }
    private createID() {
        const date = (Date.now() + Math.floor(Math.random() * 10000)).toString(16)
        const id = `node_${this.titleContent}_${date}`
        this.id = id
    }
    getAttribute(key: string) {
        return this._attributes.find(attr => attr.name === key)
    }
    get outputs() {
        return this._outputs
    }
    get inputs() {
        return this._inputs
    }
    get attributes() {
        return this._attributes
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
    center() {
        this.x = (DataBus.app.screen.width - this.width) / 2
        this.view.y = (DataBus.app.screen.height - this.width) / 2
        this.view.zIndex = 100
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
        this.view.zIndex = 1
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
        this.view.onpointertap = this.onpointertap.bind(this)
        this.initEvents()
    }

    private onpointertap(e: PIXI.FederatedPointerEvent) {
        if (e.button === 2) {
            if (!this.edit.delete) {
                return
            }
            const hasInput = this._inputs.find(input => input.socket?.isBussing === true)
            if (hasInput) {
                return
            }
            const hasOutput = this._outputs.find(output => output.parms !== undefined)
            if (hasOutput) {
                return
            }
            DataBus.reMoveNode(this)
        }
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
        if(this._outputs.find(item => item.key === output.key)) {
            return
        }
        this._outputs.push(output)
        this.createOutputs()
    }

    addInput(input: SocketObject) {
        if(this._inputs.find(item => item.key === input.key)) {
            return
        }
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
        const top = this.attributesBox.getBounds().height + this.attributesBox.y + this.padding / 2
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
        const top = this.attributesBox.getBounds().height + this.attributesBox.y + this.padding / 2
        this.outputBox.removeChildren();
        const x = this.width / 2 - this.padding / 2
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
                        trim: true,

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
            if (this._outputs[index].socket.connection !== undefined) {
                return
            }
            this._outputs.splice(index, 1)
            this.createOutputs()

        }
    }

    addAttribute(attr: NodeAttribute) {
        if(this._attributes.find(item => item.name === attr.name)) {
            return
        }
        this._attributes.push(attr)
        this.createAttributes()
        this.rerender()
    }

    private createAttributes() {
        this.attributesBox.removeChildren();

        for (let i = 0; i < this._attributes.length; i++) {
            const attribute = this._attributes[i];
            const text = new PIXI.Text({
                text: attribute.name,
                style: {
                    fontSize: 16,
                    fill: 0xffffff,
                    wordWrap: false,
                    wordWrapWidth: 60,
                    trim: true,
                    align: 'center'
                }
            })
            text.y = this.padding + 20 * i * 1.5
            this.attributesBox.addChild(text);

            if (attribute.options) {
                const select = this.createAttrSelect(text.x + 60, text.y, attribute)
                this.attributesBox.addChild(select);
            }else{
                const input = this.createInputElement(text.x + 60, text.y, attribute)
                this.attributesBox.addChild(input);
            }

        }
    }

    private createInputElement(x: number, y: number, attr: NodeAttribute) {
        const box = new PIXI.Container({x,y})
        const bg = new PIXI.Graphics()
        const w = 80
        const h = 20
        bg.roundRect(0, 0, w, h, 5)
        bg.fill(0x3f51b5)
        const input = new Input({
            bg,
            value: attr.value,
            textStyle:{
                fontSize: 16,
                fill: 0xffffff,
                align:'center',
            },
            align:'center'
        });
        input.width = w
        const mask = new PIXI.Graphics()
        mask.roundRect(0, 0, w, h, 5)
        mask.fill(0x3f51b5)
        input.mask = mask
        box.addChild(mask,input)
        input.onChange.connect(() => {
            attr.value = input.value
        })
        return box
    }

    private createAttrSelect(x: number, y: number, attr: NodeAttribute) {
        const w = 80
        const h = 20
        const closedBG = new PIXI.Graphics()
        closedBG.rect(0, 0, w, h)
        closedBG.fill(0x3f51b5)
        const openBG = new PIXI.Graphics()
        openBG.rect(0, 0, w, h * (attr.options || []).length)
        openBG.fill(0x3f51b5)
        // options
        const defaultIndex = attr.options?.indexOf(attr.type)
        const select = new Select({
            closedBG,
            openBG,
            textStyle: {
                fontSize: 16,
                fill: 0xffffff,
                wordWrap: false,
                wordWrapWidth: 60,
                trim: true,
                align: 'center'
            },
            items: {
                items: attr.options || [],
                backgroundColor: '#3f51b5',
                hoverColor: '#263274',
                width: w,
                height: h,
                textStyle: {
                    fontSize: 16,
                    fill: 0xffffff,
                    wordWrap: false,
                    wordWrapWidth: 60,
                    trim: true,
                    align: 'center'
                },
                radius: 4
            },
            selected: defaultIndex,
            scrollBox: {
                width: w,
                height: h * (attr.options || []).length,
                radius: 4
            }
        });

        select.x = x
        select.y = y
        select.onpointerenter = () => {
            select.zIndex = 200
            this.outputBox.visible = false
            select.open()
        }
        select.onpointerleave = () => {
            select.zIndex = 0
            this.outputBox.visible = true
            select.close()
        }
        select.onpointerout = () => {
            select.zIndex = 0
            this.outputBox.visible = true
            select.close()
        }
        select.onSelect.connect((_: number, value: string) => {
            this.setAttribute(attr, value)
        })
        return select
    }
    getDefaultValue() {
        let val: any
        const t = this.getAttribute('type')
        if (!t) {
            return
        }
        switch (t.type) {
            case 'string':
                val = '';
                break
            case 'number':
                val = 0;
                break
            case 'boolean':
                val = false;
                break
            case 'array':
                val = [];
                break
        }
        return val
    }
    private setAttribute(attr: NodeAttribute, value: any) {
        attr.type = value
        attr.value = this.getDefaultValue()
    }
}