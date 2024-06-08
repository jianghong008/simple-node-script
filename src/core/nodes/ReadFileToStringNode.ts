import { BuiltInFunc } from "./BuiltInFunc";

export class ReadFileToStringNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'ReadFileToString');
        this.edit.out = false
        this.funcName = 'readFileToString';
        this.addInput({ key: 'path' })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}