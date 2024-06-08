
interface SocketObject {
    key: string
    socket?: NodeSocket
    parms?: {
        node: string
        socket: string
    }
}

interface SocketConnection {
    node: string
    socket: string
}

interface NodeAttribute {
    name: string
    value: string
    type: VariableType
    options?: string[]
    disable?: boolean
}