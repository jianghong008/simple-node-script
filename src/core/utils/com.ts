
export class ComUtils {
    static formatTime(time: number) {
        const date = new Date(time)
        const year = date.getFullYear()
        const month = date.getMonth() + 1
        const day = date.getDate()
        const hour = date.getHours()
        const minute = date.getMinutes()
        const second = date.getSeconds()
        return `${year}-${month}-${day} ${hour < 10 ? ('0' + hour) : hour}:${minute < 10 ? ('0' + minute) : minute}:${second < 10 ? ('0' + second) : second}`
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

    static encodeHtml(str: string) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;')
    }

    static readFile(file: File): Promise<string> {
        const reader = new FileReader()
        return new Promise((resolve, reject) => {
            if(file.size > 5 * 1024 * 1024) {
                throw new Error('file too large')
            }
            reader.onload = () => {
                if(typeof reader.result !== 'string') {
                    throw new Error('file type error')
                }
                resolve(reader.result.toString())
            }
            reader.onerror = reject
            reader.readAsText(file)
        })
    }
}