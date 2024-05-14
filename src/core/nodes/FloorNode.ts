import { BuiltInFunc } from "./BuiltInFunc";
export class FloorNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Floor')
        this.edit.out = false
        this.funcName = 'floor';
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}