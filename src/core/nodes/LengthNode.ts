import { BaseNode } from "./BaseNode";

export class LengthNode extends BaseNode {

    constructor(name?: string) {
        super(name ? name : 'Length');
        this.edit.out = false
        this.type = 'Length'
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.addAttribute({
            name: "type",
            value: "string",
            type: 'array',
            options: ['string', 'array']
        })
        this.refresh()
    }
}