export default function(amount: number, commission: number): number {
    return Math.floor(amount - (amount / 100 * commission));
}