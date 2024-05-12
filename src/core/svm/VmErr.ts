
export class VmErr extends Error {
    nodeId: string
    constructor(nodeId: string, msg: string) {
        super(msg);
        this.nodeId = nodeId
    }
}