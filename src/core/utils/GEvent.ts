export enum EventType {
    PointerDown = 'pointerdown',
    PointerUp = 'pointerup',
    PointerMove = 'pointermove',
    PointerEnter = 'pointerenter',
    PointerOut = 'pointerout',
    PointerCancel = 'pointercancel',
}
export class GEvent {
    private static _handlers: { [key: string | number]: Function[] } = {}
    public static on(type: EventType, handler: Function) {
        if (!GEvent._handlers[type]) {
            GEvent._handlers[type] = []
        }
        GEvent._handlers[type].push(handler)
    }
    public static off(type: EventType, handler: Function) {
        if (!GEvent._handlers[type]) {
            return
        }
        const index = GEvent._handlers[type].indexOf(handler)
        if (index > -1) {
            GEvent._handlers[type].splice(index, 1)
        }
    }
    public static emit(type: EventType, ...args: any[]) {
        if (!GEvent._handlers[type]) {
            return
        }
        GEvent._handlers[type].forEach(handler => {
            handler(...args)
        })
    }
}