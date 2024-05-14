import { BuiltInFunc } from "./BuiltInFunc";
export class SqrtNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Sqrt')
        this.edit.out = false
        this.funcName = 'sqrt';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}