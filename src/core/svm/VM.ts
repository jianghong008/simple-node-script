import { BaseNode } from "../nodes/BaseNode";
import { DataBus } from "../utils/DataBus";
import { AstBlock, AstToken, SgToken, StackValue, SvnToken } from "./SgToken";
import { BuiltInFuntions } from "./vm-config";

export class SvmLib {
    protected svm: Svm
    protected _stack: Map<string, StackValue>
    public name: string = 'lib'
    constructor(svm: Svm) {
        this._stack = new Map()
        this.svm = svm
    }
    static init(svm: Svm) {
        return new SvmLib(svm)
    }
    get stack() {
        return this._stack
    }
}

export class Svm {
    private stack = new Map<string, StackValue>()
    private static libStack = new Map<string, Map<string, StackValue>>()
    private status: 'running' | 'stop' = 'stop'
    private tokens: SvnToken[] = []
    constructor() {
        this.registerFunctions()
    }
    addLib(lib: SvmLib) {
        Svm.libStack.set(lib.name, lib.stack)
    }
    get Status() {
        return this.status
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
        const value = new StackValue('', key, 'function', func, '')
        this.stack.set(key, value)
    }
    registerVariable(key: string, type: VariableType, value: any, scope = '', scopeType: VariableScopeType = 'global') {
        if (this.getVariable(key) !== undefined) {
            return
        }
        const val = new StackValue('', key, type, value, scope, scopeType)
        this.stack.set(key, val)
    }
    /**
     * execute nodes
     * @param nodes 
     */
    async execute(nodes: BaseNode[]) {
        this.status = 'running'
        try {
            this.tokens = SgToken.create(nodes)
            this.stack.clear()
            this.registerFunctions()
            await this.evaluate(this.tokens)
            this.status = 'stop'
        } catch (error) {
            this.status = 'stop'
            console.error(error)
        }
    }

    private async evaluate(tokens: SvnToken[]) {
        if (this.status === 'stop') {
            return
        }
        for (const token of tokens) {
            DataBus.activeNode(token.nodeId)
            await this.evaluateToken(token)
        }
    }
    private async evaluateToken(token: SvnToken) {
        if (token instanceof AstBlock) {
            if (token.type === 'Function') {
                await this.evaluate(token.body)
            } else if (token.type === 'CallFunction' && token.funcName) {
                await this.evaluateFunction(token)
            } else if (token.type === 'Logic') {
                const condition = token.args?.map(arg => this.getVariable(arg.name)?.value)[0]
                if (Boolean(condition) === true) {
                    await this.evaluate(token.body)
                }
            } else if (token.type === 'Loop') {
                await this.evaluateLoop(token)
            } else if (token.type === 'SetVariable') {
                if (token.args?.length != 2) {
                    throw new Error(`set variable args error`)
                }
                const inputTemp = this.getVariable(token.args[1].name)
                if (inputTemp) {
                    this.updateVariable(token.args[0].name, inputTemp.value)
                }
                await this.evaluate(token.body)
            } else {
                await this.evaluate(token.body)
            }

        } else if (token instanceof StackValue) {
            this.registerVariable(token.id, token.type, token.value, token.scope, token.scopeType)
        } else if (token instanceof AstToken) {
            this.evaluateBinaryExpression(token)
        }
    }

    private async evaluateLoop(token: AstBlock) {
        if (!token.args || !token.args[0]) {
            throw new Error(`${token.id} args error`)
        }
        const arg = token.args[0]
        const argToken = this.tokens.find(t => t.nodeId === arg.name)

        let condition = this.getVariable(arg.name)?.value
        while (Boolean(condition) === true) {
            if (this.status !== 'running') {
                throw new Error(`svm stoped`)
            }
            await this.evaluate(token.body)

            if (argToken instanceof AstToken && argToken.type === 'BinaryExpression') {
                this.evaluateBinaryExpression(argToken)
            }else if(argToken instanceof AstBlock && argToken.type === 'CallFunction'){
                await this.evaluateFunction(token)
            }

            condition = this.getVariable(arg.name)?.value
        }
    }

    private evaluateBinaryExpression(token: AstToken) {
        const left = this.getVariable(token.left.name)
        const right = this.getVariable(token.right.name)
        if (left && right) {
            const result = token.operate(left, right)
            if (result != undefined) {
                this.setVariable(token.id, result, '', 'temp')
            }
        } else {
            const miss = left ? 'input2' : 'input1'
            throw new Error(`${token.id}->${miss} variable not found`)
        }
    }

    private async evaluateFunction(token: AstBlock) {
        const func = this.getVariable(token.funcName || '')
        const args = token.args?.map(arg => this.getVariable(arg.name)?.value)

        if (func) {
            if (func.value === undefined) {
                throw new Error(`${token.funcName}function not found`)
            }
            let result: any
            if (token.funType === 'async') {
                result = await func.value(...(args ? args : []), token.id)
            } else {
                result = func.value(...(args ? args : []), token.id)
            }

            if (result !== undefined) {
                // cache result
                this.setVariable(token.id, result, '', 'temp')
            } else {
                // no result
            }
        }
        // execute sub block
        await this.evaluate(token.body)
    }

    removeVariable(key: string) {
        this.stack.delete(key)
    }
    getVariable(key: string, clear = true): any {
        // local stack
        const variable = this.stack.get(key)
        if (variable !== undefined && variable.scopeType === 'temp' && clear) {
            this.removeVariable(key)
        }
        if (variable !== undefined && variable.type === 'referencing') {
            return this.getVariable(variable.value, clear)
        }
        // lib stack
        if (variable === undefined) {
            const libName = key.split('.')
            const lib = Svm.libStack.get(libName[0])
            if (lib && libName[1]) {
                return lib.get(libName[1])
            }
        }
        return variable
    }
    setVariable(key: string, value: any, scope = '', scopeType: VariableScopeType = 'global') {
        const val = this.getVariable(key, false)
        if (val !== undefined) {
            val.value = value
            return
        }
        // create variable
        const t = typeof value
        if (t === 'number' || t === 'string' || t === 'boolean') {
            this.registerVariable(key, t, value, scope, scopeType)

        }
    }

    updateVariable(key: string, value: any) {
        const val = this.stack.get(key)
        if (val !== undefined) {
            val.value = value
            return
        }
    }

    stop() {
        this.status = 'stop'
    }
}