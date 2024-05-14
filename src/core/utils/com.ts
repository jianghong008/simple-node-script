
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

    static download(content: string) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        document.body.appendChild(a)
        a.href = url
        a.download = 'sgs.json'
        a.click()
        document.body.removeChild(a)
    }
}