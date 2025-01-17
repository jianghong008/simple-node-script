import { BaseNode } from "../nodes/BaseNode";
import { BinaryOperatorNode } from "../nodes/BinaryOperatorNode";
import { BuiltInFunc } from "../nodes/BuiltInFunc";
import { ReferencingNode } from "../nodes/ReferencingNode";
import { UnaryOperatorNode } from "../nodes/UnaryOperatorNode";
import { VariableNode } from "../nodes/VariableNode";
import { AstBlock, AstToken, StackValue, SvnToken } from "./VM";
import { VmErr } from "./VmErr";

export class SgToken {
    static nodes: BaseNode[]
    static create(nodes: BaseNode[]) {
        const main = nodes.find(node => node.type === 'main')
        if (!main) {
            throw new VmErr('main', 'main not found')
        }
        SgToken.nodes = nodes
        const tokens: SvnToken[] = []
        SgToken.decode(main, '', tokens)
        return tokens
    }
    static decode(node: BaseNode, path = '', tokens: any[] = [], father?: SvnToken) {
        path = path + '/' + node.id
        const token = SgToken.parse(node, path, tokens, father)
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

    private static parse(node: BaseNode, path: string = '', tokens: any[] = [], father?: SvnToken) {
        let block: SvnToken | undefined
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
            block = new AstBlock(node.id, node.id, 'Logic', [], '', [referencing])
        } else if (node.type === 'Loop') {
            const condition = node.inputs[0]?.socket?.connection
            if (condition === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, 'Loop node condition not found')
            }
            const referencing: ReferencingValue = {
                name: condition.node,
                type: 'Variable'
            }
            block = new AstBlock(node.id, node.id, 'Loop', [], '', [referencing])
        } else if (node.type === 'Function') {
            const condition = node.inputs[0]?.socket?.connection
            if (condition === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, 'Function node input not found')
            }
            const referencing: ReferencingValue = {
                name: condition.node,
                type: 'Variable'
            }
            block = new AstBlock(node.id, node.id, 'Function', [], '', [referencing])
        } else if (node.type === 'CallFunction') {
            const callFunc = node as BuiltInFunc
            const args: ReferencingValue[] = []
            // attributes create temp variable
            for (const attr of callFunc.attributes) {
                const tempVar = new StackValue(node.id, callFunc.id + attr.name, attr.type, attr.value, path, 'temp')
                args.push({
                    type: 'Variable',
                    name: tempVar.id
                })
                if (father instanceof AstBlock) {
                    father.body.push(tempVar)
                } else {
                    tokens.push(tempVar)
                }
            }
            // inputs
            for (const input of callFunc.inputs) {
                if (input.key === 'line') {
                    continue
                }
                const parms = input.socket?.connection
                if (!parms) {
                    continue
                }
                // referencing
                const inputNode = SgToken.findNode(parms.node)
                if(!inputNode) {
                    node.setNodeErr()
                    throw new VmErr(node.id, `${node.titleContent}->${parms.node} input not found`)
                }
                if(inputNode.type === 'Referencing') {
                    const realVal = inputNode.getAttribute('reference')?.value
                    if(!realVal) {
                        node.setNodeErr()
                        throw new VmErr(node.id, `${node.titleContent}->${parms.node} reference value not set`)
                    }
                    args.push({
                        type: 'Variable',
                        name: realVal
                    })
                }else{
                    args.push({
                        type: 'Variable',
                        name: parms.node
                    })
                }
                
            }

            block = new AstBlock(node.id, callFunc.id, 'CallFunction', [], callFunc.funcName, args, callFunc.funType)
        } else if (node.type === 'Referencing') {
            const varNode = node as ReferencingNode
            const val = varNode.getAttribute('reference')?.value
            const input = varNode.getInput('input')?.socket?.connection?.node
            if (input && val) {
                // set variable
                const vari: ReferencingValue = {
                    type: 'Variable',
                    name: val
                }
                const inputVari: ReferencingValue = {
                    type: 'Variable',
                    name: input
                }
                block = new AstBlock(node.id, node.id, 'SetVariable', [], undefined, [vari, inputVari], undefined)
                const temp = new StackValue(node.id, node.id, 'referencing', SgToken.variableToType(val, 'referencing'), path, 'temp')
                block.body?.push(temp)
            } else {
                block = new StackValue(node.id, node.id, 'referencing', SgToken.variableToType(val, 'referencing'), path)
            }

        } else if (node.type === 'Variable') {
            const varNode = node as VariableNode
            const t = varNode.getVariableType()
            if (!t) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent} type not found`)
            }
            const input = varNode.inputs[1]?.socket?.connection
            if (input) {
                block = new StackValue(node.id, node.id, 'referencing', input.node, path)
            } else {
                const val = varNode.getAttribute('value')?.value
                const defaultValue = val ? val : varNode.getDefaultValue()
                block = new StackValue(node.id, node.id, t as VariableType, SgToken.variableToType(defaultValue, t as VariableType), path)
            }
        } else if (node.type === 'BinaryOperator') {
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
                const vari = referencingNode.getAttribute('reference')?.value
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
                const vari = referencingNode.getAttribute('reference')?.value
                if (vari === undefined) {
                    node.setNodeErr()
                    throw new VmErr(referencingNode.id, `${referencingNode.titleContent} value not found`)
                }
                input2 = {
                    type: 'Variable',
                    name: vari
                }
            }
            const operatorType = express.getOperatorType()
            if (operatorType === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent}->type not found`)
            }
            block = new AstToken(node.id, node.id, 'BinaryExpression', operatorType as OperatorType, input1, input2)
        } else if (node.type === 'UnaryOperator') {
            const express = node as UnaryOperatorNode
            const socket1 = express.inputs[1]
            if(!socket1) {
                throw new VmErr(node.id, `${node.titleContent}->input node not found`)
            }
            const leftNode1 = SgToken.findNode(socket1?.socket?.connection?.node)

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
                const vari = referencingNode.getAttribute('reference')?.value
                if (vari === undefined) {
                    node.setNodeErr()
                    throw new VmErr(referencingNode.id, `${referencingNode.titleContent} value not found`)
                }
                input1 = {
                    type: 'Variable',
                    name: vari
                }
            }

            const input2Var = express.getConstant()
            if (input2Var === undefined) {
                throw new VmErr(express.id, `${express.titleContent} constant not found`)
            }

            const variable = new StackValue(express.id, express.id + '_constant', 'number', input2Var, '', 'constant')
            tokens.push(variable)
            let input2: ReferencingValue = {
                type: 'Expression',
                name: variable.id
            }

            const operatorType = express.getOperatorType()
            if (operatorType === undefined) {
                node.setNodeErr()
                throw new VmErr(node.id, `${node.titleContent}->type not found`)
            }
            block = new AstToken(node.id, node.id, 'BinaryExpression', operatorType as OperatorType, input1, input2)
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