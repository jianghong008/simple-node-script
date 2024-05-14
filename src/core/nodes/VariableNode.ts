import { BaseNode } from "./BaseNode";
export class VariableNode extends BaseNode {
    public value: any = 0
    constructor(name?: string) {
        super(name ? name : 'Variable')
        this.edit.out = false
        this.type = 'Variable'
        this.addInput({ key: 'line' })
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.addAttribute({
            name: "type",
            value: 'number',
            type: 'number',
            options: ['number', 'string', 'boolean', 'array']
        })

        this.addAttribute({
            name: "value",
            value: '0',
            type: 'number',
            options: undefined
        })
        this.onAttibuteChange = this.onAttrChange.bind(this)
        this.refresh()
    }
    private onAttrChange(attr: NodeAttribute) {

        if (attr.name === 'type') {
            const val = this.getAttribute('value')
            if (val) {
                val.value = this.getDefaultValue()
            }
        } else if (attr.name === 'value') {
            const t = this.getAttribute('type')
            if (t) {
                attr.value = this.variableToType(attr.value, t.value as any)
            }
        }
        this.createAttributes()
    }

    getVariableType() {
        const t = this.getAttribute('type')
        if (t) {
            return t.value
        }
        return 'number'
    }

    private variableToType(value: any, t: VariableType) {
        let val: any = value
        switch (t) {
            case 'string':
                val = String(value)
                break
            case 'number':
                val = Number(value)
                break
            case 'boolean':
                val = Boolean(value)
                break
            case 'array':
                val = String(value).split(',')
                break
            case 'referencing':
                val = String(value)
                break
        }

        return val
    }
}