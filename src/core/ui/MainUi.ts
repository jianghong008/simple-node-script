import * as PIXI from 'pixi.js';
import * as UI from '@pixi/ui'
import { DataBus } from '../utils/DataBus';
import { TopMenus } from './config';
import { SgScript } from '../utils/SgScript';
import { NodeUtils } from '../utils/NodeUtils';
import { ComUtils } from '../utils/com';
import { $t } from '../../plugins/i18n';
import { SgToken } from '../svm/SgToken';
import { Queue } from '../utils/Queue';
export enum CompilerStatus {
    Running,
    Stop,
    Ready,
}

export class MainUi {
    public view: PIXI.Container
    private runBtn?: UI.Button
    private runTimer: any
    private logBox: HTMLDivElement
    private bottomBox: UI.List
    private status: CompilerStatus = CompilerStatus.Stop
    private startTime = 0
    constructor() {
        this.view = new PIXI.Container()
        this.logBox = document.createElement('div')
        document.body.appendChild(this.logBox)
        this.logBox.className = 'log-box'
        this.view.zIndex = 1000
        this.bottomBox = new UI.List({
            type: 'horizontal',
            padding: 5,
            elementsMargin: 5
        })
        this.init()
    }
    private async init() {
        await this.preload()
        this.createTopActions()
        this.createBottomActions()

        window.compiler.onExecuteMessage(this.onExecuteMessage.bind(this))
        window.compiler.onExecuteDone(this.onExecuteDone.bind(this))
        window.compiler.resizeEditor(this.resizeEditor.bind(this))

        window.onresize = () => {
            this.resizeEditor()
        }

        DataBus.app.canvas.addEventListener('dragover', (e) => {
            e.preventDefault()
        })
        DataBus.app.canvas.addEventListener('drop', (e) => {
            e.preventDefault()
            this.onDrop(e)
        })

    }
    async onDrop(e: DragEvent) {
        if (!e.dataTransfer?.files[0]) {
            return
        }
        try {
            const data = await ComUtils.readFile(e.dataTransfer.files[0])
            DataBus.nodesBox.removeChildren()
            const script = await SgScript.decode(data)
            DataBus.nodes = script.nodes
            DataBus.nodesBox.x = script.data.stage.x
            DataBus.nodesBox.y = script.data.stage.y
            DataBus.nodesBox.scale.set(script.data.stage.scale)
            DataBus.nodes.forEach(node => {
                DataBus.nodesBox.addChild(node.view)
            })
        } catch (error) {
            this.queueLog(String(error))
        }
    }
    private onExecuteMessage(msg: string) {
        this.queueLog(msg)
    }
    private onExecuteDone() {
        this.status = CompilerStatus.Stop
        const time = Date.now() - this.startTime
        this.queueLog(`Done ${time}ms`)
    }
    private resizeEditor() {
        DataBus.app.resize()
        this.resetDebug()
    }

    private queueLog(msg: string) {
        const date = ComUtils.formatTime(Date.now())
        // translate
        const temp = msg.split(/\s+/)
        for(let i = 0; i < temp.length; i++) {
            temp[i] = $t(temp[i])||temp[i]
        }
        const log = `<span class="log-date">${date}</span> <pre class="log-msg">${ComUtils.encodeHtml(temp.join(' '))}</pre>`
        Queue.push({
            func: this.log.bind(this),
            args: [log]
        })
    }
    private setLogVisible(visible: boolean) {
        this.logBox.style.display = visible ? 'block' : 'none'
    }
    private getLogVisible() {
        return this.logBox.style.display == 'block'
    }
    private log(msg: any) {
        if (this.getLogVisible() == false) {
            return
        }
        this.logBox.innerHTML = `${this.logBox.innerHTML}${msg}`
        this.logBox.scrollTop = this.logBox.scrollHeight
    }
    private async preload() {
        await PIXI.Assets.load('/ui/open.svg')
        await PIXI.Assets.load('/ui/save.svg')
        await PIXI.Assets.load('/ui/running.svg')
        await PIXI.Assets.load('/ui/run.svg')
        await PIXI.Assets.load('/ui/add.svg')
        await PIXI.Assets.load('/ui/teminal.svg')
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

        this.view.addChild(this.bottomBox)

        const logBtn = this.createLogBtn()

        list.addChild(loadBtn.view, saveBtn.view, newBtn, this.runBtn.view,logBtn.view)

    }

    private createBottomActions() {

        
    }

    private resetDebug() {
        if (!this.getLogVisible()) {
            this.logBox.innerHTML = ''
            this.logBox.scrollTo({
                top: 0
            })
        }
    }

    private createLogBtn() {
        const bg = PIXI.Texture.from('/ui/teminal.svg')
        const debugBtn = new UI.Button(new PIXI.Sprite(bg))
        debugBtn.view.width = 30
        debugBtn.view.height = 30
        debugBtn.onPress.connect(() => {
            this.setLogVisible(!this.getLogVisible())
            if (!this.getLogVisible()) {
                this.bottomBox.x = DataBus.app.screen.width - this.bottomBox.width
                this.logBox.innerHTML = ''
                this.logBox.scrollTo({
                    top: 0
                })
            } else {
                this.bottomBox.x = DataBus.app.screen.width - this.bottomBox.width
            }
        })
        return debugBtn
    }

    private update() {
        if (this.status === CompilerStatus.Stop) {
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
                text: $t(key),
                style: {
                    fontSize: 16,
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


            btn.onPress.connect(() => {
                scrollBox.visible = false
                this.newNode(key)
            })
            btn.onHover.connect(() => {
                nodeBg.alpha = 0.5
            })
            btn.onOut.connect(() => {
                nodeBg.alpha = 1
            })
            return btn
        })
        const scrollBox = new UI.ScrollBox({
            background: 0x3f51b5,
            width: 400,
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

        newBtn.addChild(scrollBox)
        return newBtn
    }
    private saveScript() {
        const json = SgScript.encode({
            x: DataBus.nodesBox.x,
            y: DataBus.nodesBox.y,
            scale: DataBus.nodesBox.scale.x
        }, DataBus.nodes)
        ComUtils.webDownload(json)
    }
    private async runScript() {
        if (this.status === CompilerStatus.Running) {
            return
        }
        this.status = CompilerStatus.Running
        this.runTimer = setInterval(this.update.bind(this), 100)
        try {
            const tokens = SgToken.create(DataBus.nodes)
            this.startTime = Date.now()
            console.log(tokens)
            window.compiler.execute(tokens)
        } catch (error) {
            this.status = CompilerStatus.Stop
            this.queueLog(String(error))
        }
    }
    private async newNode(t: string) {
        try {
            const nodeName = `${t}Node`
            const nodes = DataBus.nodes.filter(node => node.titleContent.includes(t))
            const ids = nodes.map(node => {
                const temp = node.titleContent.trim().split('_')
                return Number(temp[1])
            })
            const max = (ids.length > 0 ? Math.max(...ids) : 0) + 1
            const newName = `${t}_${max}`
            const node = await NodeUtils.newNode(t, newName)
            if (!node) {
                console.error(`node ${nodeName} not found`)
                return
            }
            node.center()
            DataBus.nodesBox.addChild(node.view)
            DataBus.nodes.push(node)
        } catch (error) {
            console.error(error)
        }
    }
    private async loadScript() {
        try {
            const data = await ComUtils.webOpenFile()
            DataBus.nodesBox.removeChildren()
            const script = await SgScript.decode(data)
            DataBus.nodes = script.nodes
            DataBus.nodesBox.x = script.data.stage.x
            DataBus.nodesBox.y = script.data.stage.y
            DataBus.nodesBox.scale.set(script.data.stage.scale)
            DataBus.nodes.forEach(node => {
                DataBus.nodesBox.addChild(node.view)
            })
        } catch (error) {
            this.queueLog(String(error))
        }

    }
}