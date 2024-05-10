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
    inputs: SocketObjectData[]
    outputs: SocketObjectData[]
}