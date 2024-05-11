
type OperatorType = '+' | '-' | '*' | '/' | '%' | '^' | '&' | '|' | '<' | '>' | '=' | '!' | '~' | '<<' | '>>' | '>>>' | '&=' | '|=' | '<<=' | '>>=' | '>>>=' | '**'

interface SocketObject {
    key: string
    socket?: NodeSocket
    parms?: {
        node: string
        socket: string
    }
}

type VariableType = 'string' | 'number' | 'boolean' | 'array'

interface NodeAttribute {
    name: string
    value: string
    type: VariableType
    options?: string[]
}