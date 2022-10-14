export class Helpers {
    static range = (start: any, end: any) => Array.from(
        {length: (end - start)}, (v, k) => k + start)
    }
