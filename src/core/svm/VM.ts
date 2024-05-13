import { BaseNode } from "../nodes/BaseNode";
import { AstBlock, AstToken, SgToken, StackValue } from "./SgToken";
import { BuiltInFuntions } from "./vm-config";

export class Svm {
    private stack = new Map<string, StackValue>()
    constructor() {
        this.registerFunctions()
    }
    private registerFunctions() {
        for (const key in BuiltInFuntions) {
            const func = Reflect.get(BuiltInFuntions, key)
            if (typeof func === 'function') {
                this.registerFunction(key, func)
            }
        }
    }
    registerFunction(key: string, func: Function) {
        const value = new StackValue(key, 'function', func, '')
        this.stack.set(key, value)
    }
    registerVariable(key: string, type: VariableType, value: any, scope = '', scopeType: VariableScopeType = 'global') {
        if (this.getVariable(key) !== undefined) {
            return
        }
        const val = new StackValue(key, type, value, scope, scopeType)
        this.stack.set(key, val)
    }
    /**
     * 执行节点
     * @param nodes 
     */
    execute(nodes: BaseNode[]) {
        const tokens = SgToken.create(nodes)
        this.evaluate(tokens)

    }

    private evaluate(tokens: (StackValue | AstBlock | AstToken)[]) {
        for (const token of tokens) {

            if (token instanceof AstBlock) {
                if (token)
                    if (token.type === 'Function') {
                        this.evaluate(token.body)
                    } else if (token.type === 'CallFunction' && token.funcName) {

                        const func = this.stack.get(token.funcName)
                        const args = token.args?.map(arg => this.getVariable(arg.name)?.value)

                        if (func) {
                            const result = func.value(...(args ? args : []),token.id)
                            if (result !== undefined) {
                                // cache result
                                this.setVariable(token.id, result, '', 'temp')
                            } else {
                                // no result
                            }
                        }
                    }
            }
            if (token instanceof StackValue) {
                this.registerVariable(token.id, token.type, token.value)
            }
            if (token instanceof AstToken) {
                const left = this.stack.get(token.left.name)
                const right = this.stack.get(token.right.name)

                if (left && right) {
                    const result = token.operate(left, right)
                    if (token.saveValue) {
                        this.setVariable(token.saveValue.name, result)
                    }
                }
            }

        }
    }
    removeVariable(key: string) {
        this.stack.delete(key)
    }
    getVariable(key: string) {
        const variable = this.stack.get(key)
        if (variable !== undefined && variable.scopeType === 'temp') {
            this.removeVariable(key)
        }
        return variable
    }
    setVariable(key: string, value: any, scope = '', scopeType: VariableScopeType = 'global') {
        const val = this.getVariable(key)
        if (val !== undefined) {
            val.value = value
            return
        }
        // create new variable
        const t = typeof value
        if (t === 'number' || t === 'string' || t === 'boolean') {
            this.registerVariable(key, t, value, scope, scopeType)

        }
    }
}