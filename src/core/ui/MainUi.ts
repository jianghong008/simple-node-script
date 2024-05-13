import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
import { DataBus } from '../utils/DataBus';
import { TopMenus } from './config';
import { SgScript } from '../utils/SgScript';
import { Svm } from '../svm/VM';
import { NodeUtils } from '../utils/NodeUtils';
import { ComUtils } from '../utils/com';
export class MainUi {
    public view: PIXI.Container
    private svm: Svm
    private runBtn?: UI.Button
    private runTimer?: number
    private logBox: UI.ScrollBox
    private bottomBox: UI.List
    constructor() {
        this.view = new PIXI.Container()
        this.logBox = new UI.ScrollBox({
            background: 0X111122,
            width: DataBus.app.screen.width,
            height: 200,
            elementsMargin: 2,
            padding: 4,
            globalScroll: false
        })
        this.logBox.visible = false
        this.logBox.y = DataBus.app.screen.height - 200
        this.view.addChild(this.logBox)
        this.view.zIndex = 1000
        this.bottomBox = new UI.List({
            type: 'horizontal',
            padding: 5,
            elementsMargin: 5
        })
        this.init()
        this.svm = new Svm()
    }
    private async init() {
        this.registerConsole()
        await this.preload()
        this.createTopActions()
        this.createBottomActions()
    }
    private registerConsole() {
        window.console.log = (msg, data) => {
            this.log(`${msg} ${data}`)
        }
        window.console.error = (err) => {
            this.log(err.message)
        }
    }
    private log(msg: any) {
        if (this.logBox.visible == false) {
            return
        }
        const date = ComUtils.formatTime(Date.now())
        const box = new PIXI.Container()
        const g = new PIXI.Graphics()
        g.rect(0, 0, this.logBox.width, 20)
        g.fill(0x221133)
        box.addChild(g)
        box.addChild(new PIXI.Text({
            text: `${date} ${String(msg)}`,
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
    private async preload() {
        await PIXI.Assets.load('/ui/open.svg')
        await PIXI.Assets.load('/ui/save.svg')
        await PIXI.Assets.load('/ui/running.svg')
        await PIXI.Assets.load('/ui/run.svg')
        await PIXI.Assets.load('/ui/add.svg')
        await PIXI.Assets.load('/ui/debug.svg')
    }
    private async createTopActions() {

        const list = new UI.List({
            type: 'horizontal',
            padding: 5,
            elementsMargin: 5
        })
        this.view.addChild(list)

        const bg1 = PIXI.Texture.from('/ui/open.svg')
        const loadBtn = new UI.Button(new PIXI.Sprite(bg1))
        loadBtn.view.width = 30
        loadBtn.view.height = 30
        loadBtn.onPress.connect(this.loadScript.bind(this))

        const bg2 = PIXI.Texture.from('/ui/save.svg')
        const saveBtn = new UI.Button(new PIXI.Sprite(bg2))
        saveBtn.view.width = 30
        saveBtn.view.height = 30
        saveBtn.onPress.connect(this.saveScript.bind(this))

        const newBtn = this.createNewBtn()

        this.runBtn = await this.createRunBtn()

        list.addChild(loadBtn.view, saveBtn.view, newBtn, this.runBtn.view)


    }

    private createBottomActions() {

        this.bottomBox.x = 10
        this.bottomBox.y = DataBus.app.screen.height - 60
        this.view.addChild(this.bottomBox)

        const debugBtn = this.createDebugBtn()
        this.bottomBox.addChild(debugBtn.view)
    }

    private createDebugBtn() {
        const bg = PIXI.Texture.from('/ui/debug.svg')
        const debugBtn = new UI.Button(new PIXI.Sprite(bg))
        debugBtn.view.width = 30
        debugBtn.view.height = 30
        debugBtn.onPress.connect(() => {
            this.logBox.visible = !this.logBox.visible
            if (!this.logBox.visible) {
                this.bottomBox.y = DataBus.app.screen.height - 60
                this.logBox.removeItems()
            } else {
                this.bottomBox.y = DataBus.app.screen.height - 60 - this.logBox.height
            }
        })
        return debugBtn
    }

    private update() {
        if (this.svm.Status === 'stop') {
            clearInterval(this.runTimer)
            if (!this.runBtn) {
                return
            }
            (this.runBtn.view as PIXI.Sprite).texture = PIXI.Texture.from('/ui/run.svg')
        } else {
            if (!this.runBtn) {
                return
            }
            (this.runBtn.view as PIXI.Sprite).texture = PIXI.Texture.from('/ui/running.svg')
        }
    }

    private async createRunBtn() {
        const bg1 = PIXI.Texture.from('/ui/run.svg')
        const runBtn = new UI.Button(new PIXI.Sprite(bg1))
        runBtn.onPress.connect(this.runScript.bind(this))
        runBtn.view.width = 30
        runBtn.view.height = 30

        return runBtn
    }

    private createNewBtn() {
        const bg = PIXI.Texture.from('/ui/add.svg')
        const newBtn = new PIXI.Container()
        const addBtn = new PIXI.Sprite(bg)
        addBtn.width = 30
        addBtn.height = 30
        addBtn.interactive = true
        addBtn.cursor = 'pointer'
        newBtn.addChild(addBtn)
        const btns = TopMenus.add.map(key => {
            const nodeBox = new PIXI.Container()
            const nodeBg = new PIXI.Graphics()
            const text = new PIXI.Text({
                text: key,
                style: {
                    fontSize: 18,
                    fill: 0xffffff
                }
            })
            text.x = 5
            text.y = 5
            const rect = text.getLocalBounds()
            nodeBg.roundRect(1, 2, rect.width + 10, rect.height + 10, 5)
            nodeBg.fill(0x1b2350)
            nodeBg.beginPath()
            nodeBg.roundRect(0, 0, rect.width + 10, rect.height + 10, 5)
            nodeBg.fill(0x344395)

            nodeBox.addChild(nodeBg)
            nodeBox.addChild(text)
            const btn = new UI.Button(nodeBox)

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
        const rect = addBtn.getBounds()
        scrollBox.y = rect.height + 5
        addBtn.onpointertap = () => {
            scrollBox.visible = !scrollBox.visible
        }
        btns.forEach(btn => {
            btn.onPress.connect(() => {
                scrollBox.visible = false
                const txt = btn.view.children.find(c => c instanceof PIXI.Text)
                if (txt) {
                    this.newNode((txt as PIXI.Text).text)
                }

            })
            btn.onHover.connect(() => {
                const g = btn.view.children.find(c => c instanceof PIXI.Graphics)
                if (g) {
                    g.alpha = 0.5
                }
            })
            btn.onOut.connect(() => {
                const g = btn.view.children.find(c => c instanceof PIXI.Graphics)
                if (g) {
                    g.alpha = 1
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
        if (this.svm.Status === 'running') {
            this.svm.stop()
            return
        }
        this.runTimer = setInterval(this.update.bind(this), 100)
        this.svm.execute(DataBus.nodes)
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