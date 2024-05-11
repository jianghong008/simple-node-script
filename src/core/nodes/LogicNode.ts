import { BaseNode } from "./BaseNode";
export class LogicNode extends BaseNode{
    constructor() {
        super('Logic')
        this.edit.out = true
        this.outputName = 'line'
        this.addInput({ key: 'condition' })
        this.refresh()
    }
}