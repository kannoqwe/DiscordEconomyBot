import { red, blue, bold } from 'kleur';
import moment from 'moment';

export default class Logger {
    static log(content: string, options?: { error: boolean }) {
        const color = options?.error ? red : blue;
        const timestamp = color(bold(`[${moment().format('YYYY-MM-DD HH:mm:ss')}]:`));
        const stream = process.stderr;

        stream.write(`${timestamp} ${content}\n`);
    }
}
