import { AppComUtils } from "../uitls/com"

export const I18n = {
    data: new Map<string, Map<string, string>>(),
    lang: '简体中文|ZH',
    followingSystem: true,
}

export function getCurrentLang(lang?: string) {
    if (lang) {
        return lang.split('|')[0]
    }
    return I18n.lang.split('|')[0]
}

export function setLang(lang: string) {
    I18n.lang = lang
    window.localStorage.setItem(import.meta.env.VITE_TGPET_VERSION + '_lang', lang)
}

export async function loadCSV() {
    const path = AppComUtils.getBasePath()+ 'local/lang.csv'
    const res = await fetch(path)
    const rowRge = /\n(?=(?:[^"]*"[^"]*")*[^"]*$)/g
    const rows = (await res.text()).split(rowRge)
    const colRge = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/g
    const head = String(rows[0]).split(colRge)

    for (let i = 0; i < rows.length; i++) {
        if (String(rows[i]).trim() === '' || i == 0) {
            continue
        }
        const cols = rows[i].split(colRge)
        for (let j = 0; j < head.length; j++) {
            if (j == 0 || head[j].trim() === '') {
                continue
            }
            const col = cols[j]
            const curVal = I18n.data.get(head[j])
            if (curVal) {
                curVal.set(cols[0], col)
                I18n.data.set(head[j], curVal)
            } else {
                const val = new Map<string, string>()
                val.set(cols[0], col)
                I18n.data.set(head[j], val)
            }
        }

    }
    const ar = Array.from(I18n.data.keys())
    for (const l of ar) {
        const code = l.split('|')[0]
        if (window.navigator.language.includes(code) && I18n.followingSystem) {
            setLang(l)
            break
        }
    }
}

export function $t(k: string, data?: any) {
    const temp = k.trim().split('_')
    k = temp[0]
    if (!I18n.data.has(I18n.lang)) {
        console.warn('no i18n data:', I18n.lang)
        return ''
    }
    if (!I18n.data.get(I18n.lang)?.has(k)) {
        console.warn('no i18n data k:', k)
        return ''
    }
    let str = I18n.data.get(I18n.lang)?.get(k)
    str = String(str).trim().replace(/^"/, '').replace(/"$/, '')
    if (data) {
        for (const k in data) {
            str = str.replace(`{${k}}`, data[k])
        }
    }
    return str + (temp[1] ? `_${temp[1]}` : '')
}

export function getLangs() {
    const ar = Array.from(I18n.data.keys())
    const cache = window.localStorage.getItem(import.meta.env.VITE_TGPET_VERSION + '_lang')
    if (cache) {
        I18n.lang = cache
    } else {
        I18n.lang = ar[0] ? ar[0] : 'English|EN'
    }
    return ar
}