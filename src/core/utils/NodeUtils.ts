import { BaseNode } from "../nodes/BaseNode";

export class NodeUtils {
    static toJson(nodes: BaseNode[]) {
        const ar = nodes.map(node => {
            const json = {
                id: node.id,
                title: node.titleContent,
                x: node.x,
                y: node.y,
                inputs: NodeUtils.getInputs(node),
                outputs: NodeUtils.getOutputs(node),
            }
            return json
        })

        return JSON.stringify(ar)
    }
    static getInputs(node: BaseNode): SocketObjectData[] {
        return node.inputs.map(input => {
            return {
                key: input.key,
                connection: input.socket?.connection
            }
        })
    }
    static getOutputs(node: BaseNode): SocketObjectData[] {
        return node.outputs.map(output => {
            return {
                key: output.key,
                connection: output.socket?.connection
            }
        })
    }

    static parseJson(json: string | Object) {
        let ar: any
        if (typeof json === 'string') {
            ar = JSON.parse(json)
        } else {
            ar = json
        }

        const nodes = ar.map((node: NodeData) => {
            const n = new BaseNode(node.title)
            n.id = node.id
            n.x = node.x
            n.y = node.y
            node.inputs.forEach(input => {
                n.addInput({
                    key: input.key,
                    parms: input.connection
                })
            })
            node.outputs.forEach(output => {
                n.addOutput({
                    key: output.key,
                    parms: output.connection
                })
            })
            return n
        })
        return nodes as BaseNode[]
    }
}