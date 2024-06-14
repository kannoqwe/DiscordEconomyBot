import { AttachmentBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { Canvas, createCanvas, GlobalFonts, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import path from 'path';
import { request } from 'undici';

export default class ProfileRender {
    public interaction: CommandInteraction<'cached'>;
    public member: GuildMember;
    public canvas!: Canvas;
    public context!: SKRSContext2D;

    constructor(interaction: CommandInteraction<'cached'>, target: GuildMember) {
        this.interaction = interaction;
        this.member = target;

        GlobalFonts.registerFromPath(path.resolve('assets/profile/fonts', 'Raleway-Bold.ttf'), 'Raleway');
        GlobalFonts.registerFromPath(path.resolve('assets/profile/fonts', 'Highliner regular.otf'), 'Highliner');
    }

    public async render() {
        this.canvas = createCanvas(2560, 1440);
        this.context = this.canvas.getContext('2d');

        // Background
        const background = await this._renderBackground();
        this.context.drawImage(background, 0, 0, this.canvas.width, this.canvas.height);

        // Avatar
        await this._drawAvatar();
        // Stats
        this._drawStats();
        this._drawBalance();
        // Level
        this._drawLevel();
        this._drawLevelBar(1700, 1800);

        const buffer = await this.canvas.encode('png');
        const attachment = new AttachmentBuilder(buffer, { name: 'profile.png' });
        return attachment;
    }

    private async _renderBackground() {
        const background = await loadImage(path.resolve('assets/profile', 'default.png'));
        return background;
    }

    private async _drawAvatar() {
        const { body } = await request(this.member.displayAvatarURL({ extension: 'png' }));
        const avatar = await loadImage(await body.arrayBuffer());

        const size = 320;
        const x = 1120;
        const y = 171;

        this.context.save(); // Save the current state of the context
        this.context.beginPath();
        this.context.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2, true);
        this.context.closePath();
        this.context.clip();

        this.context.drawImage(avatar, x, y, size, size);
        this.context.restore();
        this._drawAvatarBorder(x + size / 2, y + size / 2, size);
    }

    private _drawAvatarBorder(cx: number, cy: number, size: number) {
        const borderWidth = 9;

        this.context.save();
        this.context.beginPath();
        this.context.arc(cx, cy, (size / 2) + (borderWidth / 2), 0, Math.PI * 2, true);
        this.context.closePath();
        this.context.shadowColor = '#8C8C8C';
        this.context.shadowBlur = 104.832;
        this.context.shadowOffsetX = 0;
        this.context.shadowOffsetY = 0;
        this.context.strokeStyle = '#8C8C8C';
        this.context.lineWidth = borderWidth;
        this.context.stroke();
        this.context.restore();
    }

    private _drawStats() {
        let fontSize = 48.54;
        this.context.font = `900 ${fontSize}px Raleway`;
        this.context.fillStyle = '#fff';
        this.context.textAlign = 'right';

        const messageCount = '5512';
        const online = '12ч. 30м. 52сек.';
        const top = '52 место';
        const reputation = '52 репутация';

        this.context.fillText(messageCount, 981.5 + 153, 720.16 + fontSize);
        this.context.fillText(online, 1699.41 + 285, 721.28 + fontSize);
        this.context.fillText(top, 699.56 + 209, 935.15 + fontSize);
        this.context.fillText(reputation, 1837.98 + 373, 934.66 + fontSize);

        // reputation
        fontSize = 150.77;
        this.context.font = `400 ${fontSize}px Highliner`;
        const likes = '17';
        const dislikes = '12';

        this.context.fillText(likes, 888 + 75.39, 220 + fontSize);
        this.context.fillText(dislikes, 1581.88 + 75.39, 213 + fontSize);
    }

    private _drawBalance() {
        const fontSize = 80;
        this.context.font = `700 ${fontSize}px Raleway`;
        this.context.fillStyle = '#fff';
        this.context.textAlign = 'right';

        const standardCurrency = '8910';
        const donateCurrency = '2785';

        this.context.fillText(standardCurrency, 412 + 164, 281.71 + fontSize);
        this.context.fillText(donateCurrency, 1969.74 + 160, 281.71 + fontSize);
    }

    private _drawLevel() {
        const fontSize = 265.24;
        this.context.font = `400 ${fontSize}px Highliner`;
        this.context.fillStyle = '#8C8C8C';
        this.context.textAlign = 'center';

        const level = '5';
        const x = 1242 + 88 / 2;
        const y = (941.38 + fontSize / 2) + 100;

        this.context.fillText(level, x, y);
    }

    private _drawLevelBar(currentExperience: number, requiredExperience: number) {
        const startX = 142.55;
        const startY = 1259.54;
        const barWidth = 829.45;
        const barHeight = 7;
        const lineWidth = 5.44;
        const angle = -0.02; // Угол поворота в радианах

        // Рассчитываем конечную точку линии прогресса
        const progressRatio = currentExperience / requiredExperience;
        const progressWidth = barWidth * progressRatio;
        const endX = startX + progressWidth;
        const endY = startY;

        this.context.save();
        this.context.strokeStyle = '#8C8C8C';
        this.context.lineWidth = lineWidth;

        // Переводим координаты начала линии в центр ее поворота
        this.context.translate(startX, startY);
        // Поворачиваем контекст на указанный угол
        this.context.rotate(angle * Math.PI / 180); // Преобразуем угол в радианы
        // Рисуем горизонтальную линию от начальной точки до конечной
        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(endX - startX, 0);
        this.context.stroke();

        this.context.restore();
    }
}