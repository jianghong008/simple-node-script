export class AppComUtils {
    static getBasePath() {
        let path = '/'
        if (import.meta.env.MODE === 'production') {
            path = './'
        }
        return path
    }
}