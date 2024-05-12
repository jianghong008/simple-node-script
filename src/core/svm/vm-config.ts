
export const BuiltInFuntions = {
    print: (data: any) => {
        console.log(data)
    },
    abs: (data: number) => {
        return Math.abs(data)
    },
    sqrt: (data: number) => {
        return Math.sqrt(data)
    },
    floor: (data: number) => {
        return Math.floor(data)
    },
    ceil: (data: number) => {
        return Math.ceil(data)
    },
    round: (data: number) => {
        return Math.round(data)
    },
    random: () => {
        return Math.random()
    },
}