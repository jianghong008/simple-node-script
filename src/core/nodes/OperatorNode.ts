import { BaseNode } from "./BaseNode";
export class OperatorNode extends BaseNode{
    public operatorType:OperatorType = '+'
    constructor() {
        super('Operator')
        this.edit.out = false
        this.addInput({ key: 'input1' })
        this.addInput({ key: 'input2' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}