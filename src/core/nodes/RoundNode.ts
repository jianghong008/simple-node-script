import { BuiltInFunc } from "./BuiltInFunc";
export class RoundNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Round')
        this.edit.out = false
        this.funcName = 'round';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}