import { BaseNode } from "./BaseNode";

export class MainNode extends BaseNode {

    constructor(name?: string) {
        super(name ? name : 'main');
        this.edit.out = true
        this.type = 'main'
        this.outputName = 'line'
        this.edit.delete = false
        this.addOutput({ key: 'line_1' })
        this.refresh()
    }

}