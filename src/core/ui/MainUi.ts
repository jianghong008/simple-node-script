import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
import { NodeUtils } from '../utils/NodeUtils';
import { DataBus } from '../utils/DataBus';
import { MainNode } from '../nodes/MainNode';
export class MainUi {
    public view: PIXI.Container
    constructor() {
        this.view = new PIXI.Container()
        this.init()
    }
    private async init() {
        this.createTopActions()
    }
    private createTopActions() {

        const list = new UI.List({
            type: 'horizontal',
            padding: 5,
            elementsMargin: 5
        })
        this.view.addChild(list)

        const loadBtn = new UI.Button(new PIXI.Text({
            text: 'load',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        }))
        loadBtn.onPress.connect(this.loadScript.bind(this))

        const saveBtn = new UI.Button(new PIXI.Text({
            text: 'save',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        }))
        saveBtn.onPress.connect(this.saveScript.bind(this))

        const newBtn = new UI.Button(new PIXI.Text({
            text: 'new',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        }))
        newBtn.onPress.connect(this.newNode.bind(this))

        const runBtn = new UI.Button(new PIXI.Text({
            text: 'run',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        }))
        runBtn.onPress.connect(this.runScript.bind(this))

        list.addChild(loadBtn.view, saveBtn.view,newBtn.view, runBtn.view)


    }
    private saveScript() {
        const json = NodeUtils.toJson(DataBus.nodes)
        console.log(json)
    }
    private runScript() {

    }
    private newNode() {
        const node = new MainNode()
        node.x = DataBus.app.screen.width / 2 - node.width / 2
        node.y = DataBus.app.screen.height / 2 - node.width / 2
        DataBus.nodesBox.addChild(node.view)
        DataBus.nodes.push(node)
    }
    private async loadScript() {
        const data = await import('../../../data/sgs.json')
        DataBus.nodesBox.removeChildren()
        DataBus.nodes = NodeUtils.parseJson(data.default)
        DataBus.nodes.forEach(node => {
            DataBus.nodesBox.addChild(node.view)
        })

    }
}