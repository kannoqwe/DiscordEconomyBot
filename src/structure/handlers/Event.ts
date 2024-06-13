import { Client, Event } from '#structure';
import BaseHandler from '../client/base/BaseHandler';

export default class EventHandler extends BaseHandler {
    constructor(client: Client, directory: string) {
        super(client, { directory, handleClass: Event });
    }

    protected load(event: Event) {
        if (event.ignore) return;
        if (event.once) {
            this.client.once(event.eventName, (...args) => event.execute(...args));
        } else {
            this.client.on(event.eventName, (...args) => event.execute(...args));
        }
    }
}
