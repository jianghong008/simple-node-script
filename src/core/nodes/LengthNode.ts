import { BuiltInFunc } from "./BuiltInFunc";

export class LengthNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'Length');
        this.edit.out = false
        this.funcName = 'length';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}