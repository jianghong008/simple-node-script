import { BaseNode } from "./BaseNode";

export class MainNode extends BaseNode {

    constructor(name?: string) {
        super(name ? name : 'main');
        this.edit.out = true
        this.outputName = 'line'
        this.refresh()
    }
}