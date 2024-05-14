import { BuiltInFunc } from "./BuiltInFunc";
export class AbsNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Abs')
        this.edit.out = false
        this.funcName = 'abs';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}