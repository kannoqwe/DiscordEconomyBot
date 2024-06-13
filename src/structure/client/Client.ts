import { Collection, Client as DSClient, Snowflake } from 'discord.js';
import IClient from '../interfaces/client/IClient';
import path from 'path';
import MsgCommandHandler from '../handlers/MsgCommand';
import Database from '../utils/Database';
import AppCommandHandler from '../handlers/AppCommand';
import Config from '../../config';
import IActiveGame from '../interfaces/client/misc/IActiveGame';
import EventHandler from '../handlers/Event';
import ErrorHandler from '../handlers/Error';

export default class Client extends DSClient<true> {
    public token: string;
    public EventHandler: EventHandler = new EventHandler(this, path.join(__dirname, '..', '..', 'events'));
    public MsgCommandHandler: MsgCommandHandler = new MsgCommandHandler(this, path.join(__dirname, '..', '..', 'commands'));
    public AppCommandHandler: AppCommandHandler = new AppCommandHandler(this, path.join(__dirname, '..', '..', 'commands'));
    public ErrorHandler: ErrorHandler = new ErrorHandler(this);

    public walletEmoji: string = Config.currency.wallet.emoji;
    public activeGames: Collection<Snowflake, IActiveGame> = new Collection();

    constructor(options: IClient) {
        super(options);
        this.token = options.token;
    }

    public async start() {
        await this.EventHandler.loadModules();
        await this.MsgCommandHandler.loadModules();
        await Database.authenticate();

        return this.login(this.token);
    }
}
