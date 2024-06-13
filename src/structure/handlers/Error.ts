import { Client, Logger, Utils } from '#structure';
import { grey, bold } from 'kleur';
import ErrorStackParser from 'error-stack-parser';

export default class ErrorHandler {
    public client: Client;
    constructor(client: Client) {
        this.client = client;
        this._setupProcess();
    }

    private _setupProcess() {
        process.on('unhandledRejection', async (error: Error) => {
            await this.logError(error);
        });

        process.on('uncaughtException', async (error: Error) => {
            await this.logError(error);
        });
    }

    public async logError(error: Error) {
        Utils.sendErrorToDeveloper(this.client, error);
        const parsed = ErrorStackParser.parse(error);
        Logger.log(
            `\n=========================
${grey(bold('• Ошибка:'))} ${error.name}
${grey(bold('• Содержание:'))} ${error.message}
${grey(bold('• Файл:'))} ${parsed[0].fileName} (${parsed[0].lineNumber})
=========================\n`, { error: true }
        );
    }
}
