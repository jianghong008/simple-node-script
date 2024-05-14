import { BaseNode } from "./BaseNode";
export class BinaryOperatorNode extends BaseNode {
    public operatorType: OperatorType = '+'
    constructor(name?: string) {
        super(name ? name : 'BinaryOperator')
        this.edit.out = false
        this.type = 'BinaryOperator'
        this.addInput({ key: 'input_1' })
        this.addInput({ key: 'input_2' })
        this.addOutput({ key: 'output' })
        this.addAttribute({
            name: "type",
            value: "+",
            type: 'string',
            options: ['+', '-', '*', '/', '%', '>', '<', '>=', '<=', '==', '!=', '&&', '||']
        })
        this.refresh()
    }

    getOperatorType() {
        const t = this.getAttribute('type')
        if (t) {
            return t.value
        }
        return '+'
    }
}