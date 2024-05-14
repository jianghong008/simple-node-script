import { BuiltInFunc } from "./BuiltInFunc";
export class CeilNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Ceil')
        this.edit.out = false
        this.funcName = 'ceil';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}