import { BaseNode } from "../nodes/BaseNode";
import { BinaryOperatorNode } from "../nodes/BinaryOperatorNode";
import { BuiltInFunc } from "../nodes/BuiltInFunc";
import { ReferencingNode } from "../nodes/ReferencingNode";
import { VariableNode } from "../nodes/VariableNode";
import { VmErr } from "./VmErr";

export class StackValue {
    type: VariableType
    value: any
    id: string
    scope: string
    scopeType: VariableScopeType = 'global'
    constructor(id: string, type: VariableType, value: any, scope: string, scopeType: VariableScopeType = 'global') {
        this.type = type
        this.value = value
        this.id = id
        this.scope = scope
        this.scopeType = scopeType
    }
    toString() {
        return this.id
    }
}

export class AstToken {
    id: string
    type: AstTokenType
    operator: OperatorType
    left: ReferencingValue
    right: ReferencingValue
    saveValue?: ReferencingValue
    constructor(id: string, type: AstTokenType, operator: OperatorType, left: ReferencingValue, right: ReferencingValue) {
        this.id = id
        this.type = type
        this.operator = operator
        this.left = left
        this.right = right
    }
    operate(left: StackValue, right: StackValue) {
        if (left.type === 'number' && right.type === 'number') {
            switch (this.operator) {
                case '+':
                    return left.value + right.value
                case '-':
                    return left.value - right.value
                case '*':
                    return left.value * right.value
                case '/':
                    return left.value / right.value
                case '%':
                    return left.value % right.value
                case '==':
                    return left.value === right.value
                case '!=':
                    return left.value !== right.value
                case '<':
                    return left.value < right.value
                case '>':
                    return left.value > right.value
                case '<=':
                    return left.value <= right.value
                case '>=':
                    return left.value >= right.value
            }
        }

        if (left.type === 'string' && right.type === 'string') {
            return left.value + right.value
        }

        if (left.value === 'boolean' && right.value === 'boolean') {
            switch (this.operator) {
                case '&&':
                    return left.value && right.value
                case '||':
                    return left.value || right.value
            }
        }
    }
}

export class AstBlock {
    id: string
    type: AstBlockType
    body: (StackValue | AstToken | AstBlock)[]
    funcName?: string
    args?: ReferencingValue[]
    funType?: 'async' | 'sync' = 'sync'
    constructor(id: string, type: AstBlockType, body: AstToken[], funcName?: string, args?: ReferencingValue[], funType?: 'async' | 'sync') {
        this.id = id
        this.type = type
        this.body = body
        this.funcName = funcName
        this.args = args
        this.funType = funType
    }
}

export class SgToken {
    static nodes: BaseNode[]
    static create(nodes: BaseNode[]) {
        const main = nodes.find(node => node.type === 'main')
        if (!main) {
            throw new VmErr('main', 'main not found')
        }
        SgToken.nodes = nodes
        const tokens: any[] = []
        SgToken.decode(main, '', tokens)
        return tokens
    }
    static decode(node: BaseNode, path = '', tokens: any[] = [], father?: (StackValue | AstToken | AstBlock)) {
        path = path + '/' + node.id
        const token = SgToken.parse(node, path)
        if (!token && node.type !== 'main') {
            throw new VmErr(node.id, `${node.titleContent} node wrong`)
        }
        const hasToken = tokens.find(token => token.id === node.id)
        if (token && !hasToken && node.type !== 'main') {
            if (father !== undefined && father instanceof AstBlock) {
                father.body.push(token)
            } else {
                tokens.push(token)
            }

        }
        if (token !== undefined && token instanceof AstBlock) {
            father = token
        }

        for (const output of node.outputs) {
            const childNode = SgToken.findNode(output.parms?.node)
            if (!childNode) {
                continue
            }
            SgToken.decode(childNode, path, tokens, father)
        }

        return tokens
    }

    static variableToType(value: any, t: VariableType) {
        let val: any = value
        switch (t) {
            case 'string':
                val = String(value)
                break
            case 'number':
                val = Number(value)
                break
            case 'boolean':
                val = Boolean(value)
                break
            case 'array':
                val = String(value).split(',')
                break
            case 'referencing':
                val = String(value)
                break
        }

        return val
    }

    private static parse(node: BaseNode, path: string = '') {
        let block: StackValue | AstToken | AstBlock | undefined
        if (node.type === 'Logic') {
            const condition = node.inputs[0]?.socket?.connection
            if (condition === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, 'Logic node condition not found')
            }
            const referencing: ReferencingValue = {
                name: condition.node,
                type: 'Variable'
            }
            block = new AstBlock(node.id, 'Logic', [], '', [referencing])
        }
        if (node.type === 'Loop') {
            const condition = node.inputs[0]?.socket?.connection
            if (condition === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, 'Loop node condition not found')
            }
            const referencing: ReferencingValue = {
                name: condition.node,
                type: 'Variable'
            }
            block = new AstBlock(node.id, 'Loop', [], '', [referencing])
        }
        if (node.type === 'Function') {
            const condition = node.inputs[0]?.socket?.connection
            if (condition === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, 'Function node input not found')
            }
            const referencing: ReferencingValue = {
                name: condition.node,
                type: 'Variable'
            }
            block = new AstBlock(node.id, 'Function', [], '', [referencing])
        }

        if (node.type === 'CallFunction') {
            const callFunc = node as BuiltInFunc
            const args: ReferencingValue[] = []
            for (const input of callFunc.inputs) {
                const parms = input.socket.connection
                if (!parms) {
                    continue

                }
                args.push({
                    type: 'Variable',
                    name: parms.node
                })

            }

            block = new AstBlock(callFunc.id, 'CallFunction', [], callFunc.funcName, args, callFunc.funType)
        }

        if (node.type === 'Referencing') {
            const varNode = node as ReferencingNode
            const val = varNode.getAttribute('value')?.value
            const defaultValue = val ? val : varNode.getDefaultValue()
            block = new StackValue(node.id, 'referencing', SgToken.variableToType(defaultValue, 'referencing'), path)
        }

        if (node.type === 'Variable') {
            const varNode = node as VariableNode
            const t = varNode.getAttribute('type')?.type
            if (!t) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent} type not found`)
            }
            const input = varNode.inputs[1]?.socket?.connection
            if (input) {
                block = new StackValue(node.id, 'referencing', input.node, path)
            } else {
                const val = varNode.getAttribute('value')?.value
                const defaultValue = val ? val : varNode.getDefaultValue()
                block = new StackValue(node.id, t, SgToken.variableToType(defaultValue, t), path)
            }
        }

        if (node.type === 'BinaryOperator') {
            const express = node as BinaryOperatorNode
            const socket1 = express.inputs[0]
            const leftNode1 = SgToken.findNode(socket1.socket?.connection?.node)

            if (!leftNode1) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent}->${socket1.key} node not found`)
            }
            let input1: ReferencingValue = {
                type: 'Expression',
                name: leftNode1?.id
            }
            if (leftNode1.type === 'Variable') {
                input1 = {
                    type: 'Variable',
                    name: leftNode1.id
                }
            } else if (leftNode1.type === 'Referencing') {
                const referencingNode = leftNode1 as ReferencingNode
                const vari = referencingNode.getAttribute('value')?.value
                if (vari === undefined) {
                    node.setNodeErr()
                    throw new VmErr(referencingNode.id, `${referencingNode.titleContent} value not found`)
                }
                input1 = {
                    type: 'Variable',
                    name: vari
                }
            }


            const socket2 = express.inputs[1]
            const leftNode2 = SgToken.findNode(socket2.socket?.connection?.node)

            if (!leftNode2) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent}->${socket2.key} node not found`)
            }
            let input2: ReferencingValue = {
                type: 'Expression',
                name: leftNode2?.id
            }
            if (leftNode2.type === 'Variable') {
                input2 = {
                    type: 'Variable',
                    name: leftNode2.id
                }
            } else if (leftNode2.type === 'Referencing') {
                const referencingNode = leftNode2 as ReferencingNode
                const vari = referencingNode.getAttribute('value')?.value
                if (vari === undefined) {
                    node.setNodeErr()
                    throw new VmErr(referencingNode.id, `${referencingNode.titleContent} value not found`)
                }
                input2 = {
                    type: 'Variable',
                    name: vari
                }
            }
            const operatorType = express.getAttribute('type')?.value
            if (operatorType === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent}->type not found`)
            }
            block = new AstToken(node.id, 'BinaryExpression', operatorType as OperatorType, input1, input2)
        }

        return block
    }

    static findNode(id: string | undefined) {
        if (!id) {
            return
        }
        return SgToken.nodes.find(node => node.id === id)
    }
}