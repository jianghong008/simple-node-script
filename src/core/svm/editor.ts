import { PrintNode } from "../nodes/PrintNode"
import { DataBus } from "../utils/DataBus"

export const EditotBuiltInFuntions = {
    print: (data: any, id?: string) => {
        if (id) {
            const printNode = DataBus.nodes.find(node => node.id === id)
            if (printNode) {
                (printNode as PrintNode).print(data)
            }
        }
        const temp = (id || '').split('_').slice(0, 2)
        console.log(`${temp.join('_')}: `, data)
    },
}