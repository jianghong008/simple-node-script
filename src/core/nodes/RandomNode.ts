import { BuiltInFunc } from "./BuiltInFunc";
export class RandomNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Random')
        this.edit.out = false
        this.funcName = 'random';
        this.addInput({ key: 'line' })
        this.addOutput({ key: 'output' })

        this.refresh()
    }
}