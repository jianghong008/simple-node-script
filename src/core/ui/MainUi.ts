import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
import { DataBus } from '../utils/DataBus';
import { TopMenus } from './config';
import { SgScript } from '../utils/SgScript';
import { Svm } from '../svm/VM';
import { NodeUtils } from '../utils/NodeUtils';
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

        const newBtn = this.createNewBtn()

        const runBtn = new UI.Button(new PIXI.Text({
            text: 'run',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        }))
        runBtn.onPress.connect(this.runScript.bind(this))

        list.addChild(loadBtn.view, saveBtn.view, newBtn, runBtn.view)


    }
    private createNewBtn() {

        const newBtn = new PIXI.Container()
        const text = new PIXI.Text({
            text: 'new',
            style: {
                fontSize: 18,
                fill: 0xffffff,
                fontWeight: 'bold'
            }
        })
        text.interactive = true
        text.cursor = 'pointer'
        newBtn.addChild(text)
        const btns = TopMenus.add.map(key => {
            const btn = new UI.Button(new PIXI.Text({
                text: key,
                style: {
                    fontSize: 18,
                    fill: 0xffffff
                }
            }))

            return btn
        })
        const scrollBox = new UI.ScrollBox({
            background: 0x3f51b5,
            width: 200,
            height: 300,
            padding: 5,
            items: btns.map(btn => btn.view),
            elementsMargin: 5,
            radius: 5,
        });
        scrollBox.visible = false
        const rect = text.getBounds()
        scrollBox.y = rect.height + 5
        text.onpointertap = () => {
            scrollBox.visible = !scrollBox.visible
        }
        btns.forEach(btn => {
            btn.onPress.connect(() => {
                scrollBox.visible = false
                const txt = btn.view as PIXI.Text
                this.newNode(txt.text)
            })
            btn.onHover.connect(() => {
                const txt = btn.view as PIXI.Text
                txt.style = {
                    fontSize: 18,
                    fill: 0xffffff,
                    fontWeight: 'bold'
                }
            })
            btn.onOut.connect(() => {
                const txt = btn.view as PIXI.Text
                txt.style = {
                    fontSize: 18,
                    fill: 0xffffff,
                }
            })
        })
        newBtn.addChild(scrollBox)
        return newBtn
    }
    private saveScript() {
        const json = SgScript.encode({
            x: DataBus.nodesBox.x,
            y: DataBus.nodesBox.y,
            scale: DataBus.nodesBox.scale.x
        }, DataBus.nodes)
        console.log(json)
    }
    private runScript() {
        const vm = new Svm()
        vm.execute(DataBus.nodes)
    }
    private async newNode(t: string) {
        try {
            const nodeName = `${t}Node`
            const count = DataBus.nodes.filter(node => node.titleContent.includes(t)).length
            const newName = `${t}_${count}`
            const node = await NodeUtils.newNode(t, newName)
            if (!node) {
                console.error(`node ${nodeName} not found`)
                return
            }

            node.x = DataBus.app.screen.width / 2 - node.width / 2
            node.y = DataBus.app.screen.height / 2 - node.width / 2
            DataBus.nodesBox.addChild(node.view)
            DataBus.nodes.push(node)
        } catch (error) {
            console.error(error)
        }
    }
    private async loadScript() {
        const data = await import('../../../data/sgs.json')
        DataBus.nodesBox.removeChildren()
        const script = await SgScript.decode(data.default as any)
        DataBus.nodes = script.nodes
        DataBus.nodesBox.x = script.data.stage.x
        DataBus.nodesBox.y = script.data.stage.y
        DataBus.nodesBox.scale.set(script.data.stage.scale)
        DataBus.nodes.forEach(node => {
            DataBus.nodesBox.addChild(node.view)
        })

    }
}