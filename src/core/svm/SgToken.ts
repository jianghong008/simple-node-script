import { BaseNode } from "../nodes/BaseNode";
import { BinaryOperatorNode } from "../nodes/BinaryOperatorNode";
import { BuiltInFunc } from "../nodes/BuiltInFunc";
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
}

export class AstToken {
    id: string
    type: AstTokenType
    operator: OperatorType
    left: ReferencingValue
    right: ReferencingValue
    saveValue?: ReferencingValue
    constructor(id: string, type: AstTokenType, operator: OperatorType, left: ReferencingValue, right: ReferencingValue, saveValue?: ReferencingValue) {
        this.id = id
        this.type = type
        this.operator = operator
        this.left = left
        this.right = right
        this.saveValue = saveValue
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
    body: AstToken[]
    funcName?: string
    args?: ReferencingValue[]
    constructor(id: string, type: AstBlockType, body: AstToken[], funcName?: string, args?: ReferencingValue[]) {
        this.id = id
        this.type = type
        this.body = body
        this.funcName = funcName
        this.args = args
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
    static decode(node: BaseNode, path = '', tokens: any[] = []) {
        path = path + '/' + node.id
        const token = SgToken.parse(node, path)
        if (!token && node.type !== 'main') {
            throw new VmErr(node.id, `${node.titleContent} node wrong`)
        }
        const hasToken = tokens.find(token => token.id === node.id)
        if (token && !hasToken && node.type !== 'main') {
            tokens.push(token)
        }
        for (const output of node.outputs) {
            const childNode = SgToken.findNode(output.parms?.node)
            if (!childNode) {
                continue
            }
            SgToken.decode(childNode, path, tokens)
        }

        return tokens
    }

    static variableToType(value: any, t: VariableType) {
        let val: any = undefined
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
        }

        return val
    }

    private static parse(node: BaseNode, path: string = '') {
        let block: StackValue | AstToken | AstBlock | undefined
        if (node.type === 'Logic') {
            block = new AstBlock(node.id, 'Logic', [])
        }
        if (node.type === 'Loop') {
            block = new AstBlock(node.id, 'Loop', [])
        }
        if (node.type === 'Function') {
            block = new AstBlock(node.id, 'Function', [])
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
            
            block = new AstBlock(callFunc.id, 'CallFunction', [], callFunc.funcName, args)
        }

        if (node.type === 'Referencing') {
            block = new AstBlock(node.id, 'Function', [])
        }

        if (node.type === 'Variable') {
            const varNode = node as VariableNode
            const t = varNode.getAttribute('type')?.type
            if (!t) {
                throw new VmErr(node.id, `${node.titleContent} type not found`)
            }
            const val = varNode.getAttribute('value')?.value
            const defaultValue = val ? val : varNode.getDefaultValue()
            block = new StackValue(node.id, t, SgToken.variableToType(defaultValue, t), path)
        }

        if (node.type === 'BinaryOperator') {
            const express = node as BinaryOperatorNode
            const socket1 = express.inputs[0]
            const leftNode1 = SgToken.findNode(socket1.socket?.connection?.node)

            if (!leftNode1) {
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
            }

            const socket2 = express.inputs[0]
            const leftNode2 = SgToken.findNode(socket2.socket?.connection.node)

            if (!leftNode2) {
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
            }

            const output = express.outputs[0].parms?.node
            let outputVar: ReferencingValue | undefined
            if (output) {
                outputVar = {
                    type: 'Variable',
                    name: output
                }
            }
            block = new AstToken(node.id, 'BinaryExpression', express.operatorType, input1, input2, outputVar)
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