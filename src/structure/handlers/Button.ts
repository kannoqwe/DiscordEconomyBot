import { Client, Button, Utils } from '#structure';
import { Collection } from 'discord.js';
import fs from 'fs';

export default class ButtonHandler {
    public client: Client;
    public directory: string;
    public buttons: Collection<string, Button> = new Collection();

    constructor(client: Client, directory: string) {
        this.client = client;
        this.directory = directory;
        void this.load();
    }

    private async load() {
        const scannedFiles: string[] = await Utils.scanDirectory(this.directory);
        scannedFiles.forEach((file) => {
            if (fs.statSync(file).isDirectory()) return;
            let pull = require(file).default;
            if (!pull) return;
            pull = new pull();
            if (pull instanceof Button) {
                pull.client = this.client;
                this.buttons.set(pull.id, pull);
            }
        });
    }
}
