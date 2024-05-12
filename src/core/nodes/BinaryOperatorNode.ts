import { BaseNode } from "./BaseNode";
export class BinaryOperatorNode extends BaseNode {
    public operatorType: OperatorType = '+'
    constructor(name?: string) {
        super(name ? name : 'BinaryOperator')
        this.edit.out = false
        this.type = 'BinaryOperator'
        this.addInput({ key: 'input1' })
        this.addInput({ key: 'input2' })
        this.addOutput({ key: 'output' })
        this.addAttribute({
            name: "type",
            value: "+",
            type: 'array',
            options: ['+', '-', '*', '/']
        })
        this.refresh()
    }
}