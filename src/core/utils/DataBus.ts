import * as PIXI from 'pixi.js';
import { BaseNode } from "../nodes/BaseNode"
import { MainUi } from '../ui/MainUi'
export class DataBus {
    private static _data: any = {}
    public static nodes: BaseNode[] = []
    public static ui: MainUi
    public static app: PIXI.Application
    public static nodesBox: PIXI.Container
    private static _input?: HTMLInputElement
    public static compilerReady = false

    public static set(key: string, value: any) {
        this._data[key] = value
    }
    public static get<T>(key: string) {
        return this._data[key] as (T | undefined)
    }
    public static remove(key: string) {
        delete this._data[key]
    }
    public static clear() {
        this._data = {}
    }

    public static reMoveNode(node: BaseNode) {
        this.nodes = this.nodes.filter(n => n !== node)
        this.nodesBox.removeChild(node.view)
    }

    public static activeNode(id:string){
        const node = this.nodes.find(node => node.id === id)
        if(node){
            node.setNodeActive()
        }
    }

    public static resetNodeActive(){
        for(const node of this.nodes){
            node.setNodeUnActive()
        }
    }

    public static get input() {
        if (!DataBus._input) {
            DataBus._input = document.createElement('input')
            DataBus._input.className = 'sgs-input'
            document.body.appendChild(DataBus._input)
        }
        return DataBus._input
    }
}