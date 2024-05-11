import { BaseNode } from "./BaseNode";
export class MathNode extends BaseNode {
    constructor(name?: string) {
        super(name ? name : 'Math')
        this.edit.out = false
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })

        this.addAttribute({
            name: "type",
            value: 'random',
            type: 'array',
            options: ['round', 'floor', 'ceil', 'abs', 'sqrt', 'random']
        })

        this.refresh()
    }
}