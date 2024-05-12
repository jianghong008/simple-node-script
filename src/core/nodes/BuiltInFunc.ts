import { BaseNode } from "./BaseNode";

export class BuiltInFunc extends BaseNode {
    public funcName: string
    public constructor(funcName: string) {
        super(funcName);
        this.edit.out = false
        this.type = 'CallFunction'
        this.funcName = funcName
    }
}