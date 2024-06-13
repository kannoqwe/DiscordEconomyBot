export default class Random {
    static choice(array: any[]) {
        return array[Math.floor(Math.random() * array.length)];
    }

    static randint(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}