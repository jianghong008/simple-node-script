import { BuiltInFunc } from "./BuiltInFunc";
export class InvertNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Invert')
        this.edit.out = false
        this.funcName = 'invert';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}