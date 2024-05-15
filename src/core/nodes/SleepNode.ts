import { BuiltInFunc } from "./BuiltInFunc";
export class SleepNode extends BuiltInFunc {
    constructor(name?: string) {
        super(name ? name : 'Sleep')
        this.edit.out = true
        this.funcName = 'sleep';
        this.outputName = 'line'
        this.funType = 'async'
        this.addInput({ key: 'line' })
        this.addInput({ key: 'input' })
        this.addAttribute({
            name: "waitTime",
            value: '1000',
            type: 'string',
        })
        this.refresh()
    }
}