import { BaseNode } from "./BaseNode";
export class LoopNode extends BaseNode{
    constructor() {
        super('Loop')
        this.edit.out = true
        this.outputName = 'line'
        this.addInput({ key: 'condition' })
        this.refresh()
    }
}