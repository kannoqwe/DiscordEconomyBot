import EventEmitter from 'events';
import { AppCommand, Client, MsgCommand, Event, Utils } from '#structure';
import fs from 'fs';
import IBaseHandler from '../../interfaces/client/base/IBaseHandler';

export default abstract class BaseHandler {
    public client: Client;
    public directory: string;
    public handleClass: typeof Event | typeof AppCommand | typeof MsgCommand;

    protected constructor(client: Client, options: IBaseHandler) {
        this.client = client;
        this.directory = options.directory;
        this.handleClass = options.handleClass;
    }

    protected abstract load(pull: Event | AppCommand | MsgCommand): any;

    public async loadModules() {
        const scannedFiles: string[] = await Utils.scanDirectory(this.directory);
        for (const file of scannedFiles) {
            if (fs.statSync(file).isDirectory()) continue;
            let pull = (await import(file)).default;
            if (!pull) continue;
            pull = new pull();
            if (pull instanceof this.handleClass) {
                pull.client = this.client;
                this.load(pull);
            }
        }
    }
}