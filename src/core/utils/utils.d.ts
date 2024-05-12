interface SocketObjectData {
    key: string
    connection?: {
        node: string
        socket: string
    }
}

interface NodeData {
    id: string
    x: number
    y: number
    title: string
    type: string
    inputs: SocketObjectData[]
    outputs: SocketObjectData[]
    attributes: NodeAttribute[]
}

interface SgscriptStage {
    x: number
    y: number
    scale: number
}

interface SgscriptData {
    nodes: NodeData[]
    stage: SgscriptStage
}

interface SgScriptObject {
    data: SgscriptData
    nodes: BaseNode[]
}