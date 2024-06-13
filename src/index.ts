import { Client, Config } from '#structure';
import { Partials } from 'discord.js';

const client = new Client({
    token: Config.token,
    intents: 131071,
    partials: [Partials.Channel, Partials.Message, Partials.User, Partials.GuildMember, Partials.Reaction]
});

void client.start();
