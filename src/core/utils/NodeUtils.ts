import { BaseNode } from "../nodes/BaseNode";

export class NodeUtils {
    static encode(nodes: BaseNode[]) {
        const ar = nodes.map(node => {
            const json = {
                id: node.id,
                title: node.titleContent,
                x: Math.round(node.x),
                y: Math.round(node.y),
                type: node.className,
                inputs: NodeUtils.getInputs(node),
                outputs: NodeUtils.getOutputs(node),
                attributes: node.attributes
            }
            return json
        })

        return ar
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

    static async decode(ar: NodeData[]) {
        const nodes: BaseNode[] = []
        for (const node of ar) {
            const n = await NodeUtils.newNode(node.type, node.title)
            if (!n) {
                return
            }
            n.id = node.id
            n.x = node.x
            n.y = node.y
            for (const attr of node.attributes) {
                n.addAttribute(attr)
            }
            for (const input of node.inputs) {
                n.addInput({
                    key: input.key,
                    parms: input.connection
                })
            }
            for (const output of node.outputs) {
                n.addOutput({
                    key: output.key,
                    parms: output.connection
                })
            }

            nodes.push(n)
        }
        return nodes
    }

    static async newNode(t: string, newName: string): Promise<BaseNode | undefined> {
        try {
            const nodeName = `${t}Node`
            const nodeClass = await import(`../nodes/${nodeName}.ts`)
            if (!nodeClass[nodeName]) {
                console.error(`node ${nodeName} not found`)
                return
            }
            return new nodeClass[nodeName](newName)
        } catch (error) {
            console.error(error)
            return
        }
    }
}