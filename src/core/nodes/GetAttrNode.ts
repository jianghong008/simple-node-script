import { BuiltInFunc } from "./BuiltInFunc";

export class GetAttrNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'GetAttrNode');
        this.edit.out = false
        this.funcName = 'getAttr';
        this.addAttribute({
            name: "attrName",
            value: "id",
            type: "string"
        })
        this.addInput({ key: 'input' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}