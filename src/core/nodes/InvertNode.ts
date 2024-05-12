import { BaseNode } from "./BaseNode";
export class InvertrNode extends BaseNode {
    constructor(name?: string) {
        super(name ? name : 'Invert')
        this.edit.out = false
        this.type = 'Invert'
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}