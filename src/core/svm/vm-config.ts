import { PrintNode } from "../nodes/PrintNode"
import { DataBus } from "../utils/DataBus"

export const BuiltInFuntions = {
    print: (data: any,id?:string) => {
        if(id){
            const printNode = DataBus.nodes.find(node => node.id === id)
            if(printNode){
                (printNode as PrintNode).print(data)
            }
        }
        console.log(`${id}: `,data)
    },
    abs: (data: number) => {
        return Math.abs(data)
    },
    sqrt: (data: number) => {
        return Math.sqrt(data)
    },
    floor: (data: number) => {
        return Math.floor(data)
    },
    ceil: (data: number) => {
        return Math.ceil(data)
    },
    round: (data: number) => {
        return Math.round(data)
    },
    random: () => {
        return Math.random()
    },
}