import { BaseNode } from "../nodes/BaseNode"
import { NodeUtils } from "./NodeUtils"

export class SgScript {
    static async decode(text: string | SgscriptData) {
        const script: SgScriptObject = {
            data: {
                nodes: [],
                stage: {
                    x: 0,
                    y: 0,
                    scale: 0
                }
            },
            nodes: []
        }
        try {
            let temp: SgscriptData
            if (typeof text === 'string') {
                temp = JSON.parse(text)
            } else {
                temp = text
            }
            script.data = temp
            const nodes = await NodeUtils.decode(temp.nodes)
            if(nodes){
                script.nodes = nodes
            }

        } catch (error) {
            console.error(Error(`SgScript decode error: ${error}`))
        }
        return script
    }

    static encode(stage:SgscriptStage, nodes: BaseNode[]) {
        const script: SgscriptData = {
            nodes: NodeUtils.encode(nodes),
            stage
        }
        return JSON.stringify(script)
    }
}