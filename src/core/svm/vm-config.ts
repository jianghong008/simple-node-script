import { PrintNode } from "../nodes/PrintNode"
import { DataBus } from "../utils/DataBus"

export const BuiltInFuntions = {
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
    sleep: (data: number) => {
        return new Promise(resolve => {
            setTimeout(resolve, data)
        })
    },
    invert: (data: any) => {
        return !Boolean(data)
    },
    length(data: any) {
        if (typeof data === 'string') {
            return data.length
        } else if (typeof data === 'object' && data.length) {
            return data.length
        } else {
            return 0
        }
    },
    getAttr(obj: any, attr: string) {
        if (obj === undefined || obj === null) {
            return undefined
        }
        return obj[attr]
    }
}