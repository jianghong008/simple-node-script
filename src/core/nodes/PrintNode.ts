import { BaseNode } from "./BaseNode";

export class PrintNode extends BaseNode {

    constructor(name?: string) {
        super(name ? name : 'Print');
        this.edit.out = false
        this.addInput({ key: 'input' })
        this.refresh()
    }
}