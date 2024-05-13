import { BaseNode } from "./BaseNode";
import { NodeSocket } from "./NodeSocket";
export class ReferencingNode extends BaseNode {
    public value: any = 0
    constructor(name?: string, val?: string) {
        super(name ? name : 'Referencing')
        this.edit.out = false
        this.type = 'Referencing'
        this.addInput({ key: 'line' })
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.addAttribute({
            name: "value",
            value: val ? val : 'none',
            type: 'string',
            options: undefined,
            disable: true
        })
        this.onConnect = this.onSocketConnect.bind(this)
        this.refresh()

        this.view
    }
    private onSocketConnect(from: NodeSocket, to: NodeSocket) {
        if (to.parent.id != this.id || to.key != 'input') {
            return
        }
        const attr = this.getAttribute('value')
        if (!attr) {
            return
        }
        
        from.disconnect()
        attr.value = from.parent.id
        this.createAttributes()
        this.createInputs()
        this.createOutputs()
    }
}