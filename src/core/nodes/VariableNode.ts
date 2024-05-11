import { BaseNode } from "./BaseNode";
export class VariableNode extends BaseNode {
    constructor(name?: string) {
        super(name ? name : 'Variable')
        this.edit.out = false
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.addAttribute({
            name: "type",
            value: "+",
            type: 'array',
            options: ['string', 'number', 'boolean', 'array']
        })

        this.refresh()
    }
}