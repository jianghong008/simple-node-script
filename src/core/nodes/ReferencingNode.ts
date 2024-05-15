import { BaseNode } from "./BaseNode";
import { NodeSocket } from "./com/NodeSocket";
export class ReferencingNode extends BaseNode {
    public value: any = 0
    constructor(name?: string, val?: string) {
        super(name ? name : 'Referencing')
        this.edit.out = false
        this.type = 'Referencing'
        this.addInput({ key: 'line' })
        this.addInput({ key: 'connect' })
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        
        this.addAttribute({
            name: "reference",
            value: val ? val : 'none',
            type: 'string',
            options: undefined,
            disable: true
        })
        this.onConnect = this.onSocketConnect.bind(this)
        this.refresh()

        this.view
    }
    addAttribute(attr: NodeAttribute) {
        super.addAttribute(attr)
    }
    private onSocketConnect(from: NodeSocket, to: NodeSocket) {
        if (to.parent.id != this.id || to.key != 'connect') {
            return
        }
        const attr = this.getAttribute('reference')
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