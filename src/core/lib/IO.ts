import { StackValue } from "../svm/SgToken";
import { Svm, SvmLib } from "../svm/VM";

export class IO extends SvmLib {
    constructor(svm: Svm) {
        super(svm)
        this.name = 'IO'

        this._stack.set(this.readToString.name, new StackValue(this.readToString.name, 'function', this.readToString, ''))
    }
    readToString(path: string) {

    }
}