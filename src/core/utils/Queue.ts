interface QueueFunc {
    func: Function
    args?: any[]
}
export class Queue {
    private static list: QueueFunc[] = []
    private static status = false
    static push(func: QueueFunc) {
        Queue.list.push(func)
        if (!Queue.status) {
            Queue.run()
        }
        
    }
    static clear() {
        Queue.status = false
        Queue.list = []
    }
    private static async run() {
        Queue.status = true
        while (Queue.list.length > 0) {
            if (!Queue.status) {
                break
            }
            const func = Queue.list.shift()
            if (func) {
                
                await Queue.execute(func)
            } else {
                break
            }
        }
        Queue.status = false
    }
    private static async execute(func: QueueFunc) {
        return new Promise((resolve) => {
            setTimeout(() => {
                try {
                    func.func(...(func.args ? func.args : []))
                    resolve(true)
                } catch (error) {
                    resolve(true)
                }
            }, 500)
        })
    }
}