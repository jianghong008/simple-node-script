type VariableType = 'string' | 'number' | 'boolean' | 'array' | 'function' | 'object'

type OperatorType = '+' | '-' | '*' | '/' | '%' | '^' | '&' | '|' | '&&' | '||' | '<' | '>' | '==' | '!' | '~' | '!=' | '<=' | '>='
type AstTokenType = 'BinaryExpression' | 'Literal' | 'Identifier' | 'UnaryExpression' | 'MemberExpression' | 'CallExpression'

interface ReferencingValue {
    type: 'Expression' | 'Variable'
    name: string
}

type AstBlockType = 'Logic' | 'Loop' | 'Function' | 'CallFunction'

type VariableScopeType = 'global' | 'local' | 'temp' | 'constant'
