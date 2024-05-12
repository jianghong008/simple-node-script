import { BuiltInFunc } from "./BuiltInFunc";

export class PrintNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'Print');
        this.funcName = 'print';
        this.addInput({ key: 'input' })
        this.refresh()
    }
}