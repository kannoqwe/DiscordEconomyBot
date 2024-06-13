import { Client } from '#structure';

export default class BaseModule {
    public client!: Client;
    public id: string;
    constructor(id: string) {
        this.id = id;
    }
}
