import { BaseNode } from "./BaseNode";

export class MainNode extends BaseNode {

    constructor() {
        super('main');
        this.edit.out = true
        this.outputName = 'line'
        this.refresh()
    }
}