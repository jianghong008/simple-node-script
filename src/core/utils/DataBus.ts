import * as PIXI from 'pixi.js';
import { BaseNode } from "../nodes/BaseNode"
import {MainUi} from '../ui/MainUi'
export class DataBus {
    private static _data: any = {}
    public static nodes: BaseNode[] = []
    public static ui: MainUi
    public static app: PIXI.Application
    public static nodesBox: PIXI.Container
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
}