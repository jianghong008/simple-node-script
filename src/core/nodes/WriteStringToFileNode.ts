import { BuiltInFunc } from "./BuiltInFunc";

export class WriteStringToFileNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'WriteStringToFile');
        this.edit.out = false
        this.funcName = 'writeStringToFile';
        this.addInput({ key: 'path' })
        this.addInput({ key: 'content' })
        this.refresh()
    }
}