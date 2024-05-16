
export class ComUtils {
    static formatTime(time: number) {
        const date = new Date(time)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return `${year}-${month}-${day} ${hour}:${minute}:${second}`
    }

    static webDownload(content: string) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.href = url
        a.download = 'sgs.json'
        a.click()
        document.body.removeChild(a)
    }

    static webOpenFile(): Promise<string> {
        return new Promise((resolve, reject) => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = '.json'
            input.style.display = 'none'
            document.body.appendChild(input)
            input.onchange = () => {
                const file = input.files?.[0]
                if (!file) {
                    reject()
                    return
                }
                const reader = new FileReader()
                reader.onload = () => {
                    resolve(reader.result as string)
                }
                reader.readAsText(file)
            }
            input.click()
        })
    }
    static wait(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}