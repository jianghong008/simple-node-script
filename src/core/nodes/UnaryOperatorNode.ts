import { BaseNode } from "./BaseNode";
export class UnaryOperatorNode extends BaseNode {
    public operatorType: OperatorType = '+'
    constructor(name?: string) {
        super(name ? name : 'UnaryOperator')
        this.edit.out = false
        this.type = 'UnaryOperator'
        this.addInput({ key: 'line' })
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.addAttribute({
            name: "type",
            value: "+",
            type: 'string',
            options: ['+', '-', '*', '/', '%', '<', '>=', '<=', '==', '!=']
        })
        this.addAttribute({
            name: "constent",
            value: '1',
            type: 'number',
            options: undefined
        })
        this.onAttibuteChange = this.onAttrChange.bind(this)
        this.refresh()
    }

    getConstant() {
        const v = this.getAttribute('constent')
        if (v) {
            const val = parseFloat(v.value)
            return isNaN(val) ? 1 : val
        }
    }

    getOperatorType() {
        const t = this.getAttribute('type')
        if (t) {
            return t.value
        }
        return '+'
    }

    private onAttrChange(attr: NodeAttribute) {
        if (attr.name === 'constent') {
            const v = parseFloat(attr.value)
            attr.value = String(isNaN(v) ? 0 : v)
        }
        this.createAttributes()
    }
}