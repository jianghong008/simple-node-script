import * as PIXI from 'pixi.js';
interface OutputObject {
    node?: BaseNode
    output: string
}
interface InputObject {
    node?: BaseNode
    input: string
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
        this.dragging.isDragging = false
        this.view.cursor = 'default'
    }
    private onpointerout() {
        this.view.cursor = 'default'
        this.dragging.isDragging = false
        this.background.clear()
        this.background.roundRect(0, 0, this.width, 100, 10);
        this.background.fill('#6e88ffcc');
        this.background.stroke('#4e58bf')
    }
    private onpointerdown(e: PIXI.FederatedPointerEvent) {
        this.dragging.isDragging = true
        this.dragging.x = e.clientX
        this.dragging.y = e.clientY
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
        this.background.fill('#6e88ffcc');
        this.background.stroke({ color: '#bdc421', width: 1 })
    }
    private createView() {
        this.background.roundRect(0, 0, this.width, 100, 10);
        this.background.fill('#6e88ffcc');
        this.background.stroke('#4e58bf')
        this.view.interactive = true;
        this.view.onpointerenter = this.onpointerenter.bind(this)
        this.view.onpointerdown = this.onpointerdown.bind(this)
        this.view.onpointermove = this.onpointermove.bind(this)
        this.view.onpointerup = this.onpointerup.bind(this)
        this.view.onpointerout = this.onpointerout.bind(this)


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

    private createOutputs() {
        this.outputBox.removeChildren();
        const x = this.view.width / 2 - this.padding / 2
        for (let i = 0; i < this._outputs.length; i++) {
            const output = this._outputs[i];
            const y = this.padding + 20 * i * 1.5
            const text = new PIXI.Text({
                text: output.output,
                style: {
                    fontSize: 16,
                    fill: 0xffffff,
                    wordWrap: true,
                    wordWrapWidth: 60,
                }
            })
            text.y = y
            const g = new PIXI.Graphics();
            g.y = y
            g.x = x
            g.arc(0, 5, 10, 0, 2 * Math.PI);
            g.fill(0xffffff);

            this.outputBox.addChild(g);
            this.outputBox.addChild(text);
        }
        this.rerender()
    }
}