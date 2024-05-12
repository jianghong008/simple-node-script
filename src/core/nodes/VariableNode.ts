import { BaseNode } from "./BaseNode";
export class VariableNode extends BaseNode {
    constructor(name?: string) {
        super(name ? name : 'Variable')
        this.edit.out = false
        this.type = 'Variable'
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.addAttribute({
            name: "type",
            value: '0',
            type: 'number',
            options: ['number','string', 'boolean', 'array']
        })

        this.refresh()
    }
 
}