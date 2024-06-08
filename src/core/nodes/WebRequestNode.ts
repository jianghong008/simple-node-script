import { BuiltInFunc } from "./BuiltInFunc";

export class WebRequestNode extends BuiltInFunc {

    constructor(name?: string) {
        super(name ? name : 'WebRequest');
        this.edit.out = false
        this.funcName = 'webRequest';
        this.addInput({ key: 'url' })

        this.addAttribute({
            name: "method",
            value: "GET",
            type: 'string',
            options: ['GET', 'POST', 'DELETE', 'PUT']
        })

        this.addAttribute({
            name: "header",
            value: '',
            type: 'string',
            options: undefined
        })

        this.addAttribute({
            name: "body",
            value: '',
            type: 'string',
            options: undefined
        })
        this.addOutput({ key: 'output' })
        this.refresh()
    }
}