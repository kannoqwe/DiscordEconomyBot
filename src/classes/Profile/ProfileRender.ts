import { AttachmentBuilder, CommandInteraction, GuildMember } from 'discord.js';
import { Canvas, createCanvas, GlobalFonts, loadImage, SKRSContext2D } from '@napi-rs/canvas';
import path from 'path';
import { request } from 'undici';
import drawRound from '../../modules/Profile/Render/DrawRound';
import IUserStats from '../../structure/interfaces/profile/UserStats';
import { Utils } from '#structure';

export default class ProfileRender {
    public interaction: CommandInteraction<'cached'>;
    public user: IUserStats;
    public member: GuildMember;
    public canvas!: Canvas;
    public context!: SKRSContext2D;

    constructor(interaction: CommandInteraction<'cached'>, user: IUserStats) {
        this.interaction = interaction;
        this.user = user;
        this.member = user.member;

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
        this._drawName();
        await this._drawAvatar();
        // Stats
        this._drawStats();
        this._drawBalance();
        // Level
        this._drawLevel();
        this._drawLevelBar();
        this._drawExpBar(this.user.exp, 4000);
        // Couple
        if (this.user.couple) {
            await this._drawCouple();
        }
        if (this.user.profile === 'CLOUD' || this.user.profile === 'JAPAN') {
            await this._drawMisc();
        }

        const buffer = await this.canvas.encode('png');
        return new AttachmentBuilder(buffer, { name: 'profile.png' });
    }

    private async _renderBackground() {
        return loadImage(path.resolve('assets/profile', `${this.user.profile.toLowerCase()}.png`));
    }

    private _drawName() {
        const fontSize = 77.92;
        this.context.font = `700 ${fontSize}px Raleway`;
        this.context.fillStyle = '#fff';
        this.context.textAlign = 'center';

        const username = this.member.user.username;

        const textX = 1229 + 48;
        const textY = 43 + fontSize;

        this.context.fillText(username.length > 15 ? `${username.slice(0, 13)}...` : username, textX, textY);
    }

    private async _drawAvatar() {
        const { body } = await request(this.member.displayAvatarURL({ extension: 'png' }));
        const avatar = await loadImage(await body.arrayBuffer());

        const size = 320;
        const x = 1120;
        const y = 171;

        this.context.save();
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

    private async _drawCouple() {
        const { body } = await request(this.user.couple!.displayAvatarURL({ extension: 'png' }));
        const avatar = await loadImage(await body.arrayBuffer());
        const icon = await loadImage(path.resolve('assets/profile/icons', `${this.user.profile === 'PREMIUM' ? 'premium' : 'default'}.png`));

        const iconSize = 74.49;
        const iconX = 1050;
        const iconY = 550;

        // аватар
        const avatarWidth = 70;
        const avatarHeight = 70;
        const avatarX = 1437.51;
        const avatarY = 550;
        const borderRadius = 19;

        this.context.save();
        drawRound(this.context, avatarX, avatarY, avatarWidth, avatarHeight, borderRadius);
        this.context.clip();
        this.context.drawImage(avatar, avatarX, avatarY, avatarWidth, avatarHeight);
        this.context.restore();

        // иконка
        this.context.save();
        this.context.translate(iconX + iconSize / 2, iconY + iconSize / 2);
        this.context.rotate(-23.15 * Math.PI / 180);
        this.context.translate(-(iconX + iconSize / 2), -(iconY + iconSize / 2));
        this.context.drawImage(icon, iconX, iconY, iconSize, iconSize);
        this.context.restore();

        // Ник
        const username = this.user.couple!.user.username;
        this.context.font = '700 60px Raleway';
        this.context.fillStyle = '#FFFFFF';
        this.context.textAlign = 'center';
        this.context.textBaseline = 'middle';
        const textX = 1185.51 + 181 / 2;
        const textY = 550 + 70 / 2;
        this.context.fillText(username.length > 7 ? `${username.slice(0, 8)}...` : username, textX, textY);
    }

    private _drawStats() {
        let fontSize = 48.54;
        this.context.font = `900 ${fontSize}px Raleway`;
        this.context.fillStyle = '#fff';
        this.context.textAlign = 'right';

        const messageCount = this.user.message.toString();
        const online = Utils.convertOnline(this.user.online, false);
        const top = `${this.user.top} место`;
        const reputation = `${this.user.likes - this.user.dislikes} репутация`;

        this.context.fillText(messageCount, 981.5 + 153, 714.16 + fontSize);
        this.context.fillText(online, 1699.41 + 285, 714.28 + fontSize);
        this.context.fillText(top, 699.56 + 209, 928.15 + fontSize);
        this.context.fillText(reputation, 1837.98 + 368, 928.66 + fontSize);

        // reputation
        fontSize = 150.77;
        this.context.font = `400 ${fontSize}px Highliner`;
        const likes = this.user.likes.toString();
        const dislikes = this.user.dislikes.toString();

        this.context.fillText(likes, 888 + 75.39, 220 + fontSize);
        this.context.fillText(dislikes, 1581.88 + 75.39, 213 + fontSize);
    }

    private _drawBalance() {
        const fontSize = 80;
        this.context.font = `700 ${fontSize}px Raleway`;
        this.context.fillStyle = '#fff';
        this.context.textAlign = 'right';

        const standardCurrency = this.user.standardCurrency.toString();
        const donateCurrency = this.user.donateCurrency.toString();

        this.context.fillText(standardCurrency, 417 + 164, 281.71 + fontSize);
        this.context.fillText(donateCurrency, 1991.74 + 160, 281.71 + fontSize);
    }

    private _drawLevel() {
        const fontSize = 265.24;
        this.context.font = `400 ${fontSize}px Highliner`;
        this.context.fillStyle = '#8C8C8C';
        this.context.textAlign = 'center';

        const level = this.user.lvl.toString();

        const x = 1242 + 88 / 2;
        const y = (941.38 + fontSize / 2) + 100;

        this.context.fillText(level, x, y);
    }

    private _drawLevelBar() {
        const fontSize = 120.56;
        this.context.font = `400 ${fontSize}px Highliner`;
        this.context.fillStyle = '#8C8C8C';
        this.context.textAlign = 'center';

        const lastLvl = this.user.lvl.toString();
        const xLast = 128 + 40 / 2;
        const yLast = 1075 + 139 / 2 + fontSize / 2;
        this.context.fillText(lastLvl, xLast, yLast);

        const nextLvl = (this.user.lvl + 1).toString();
        const xNext = 2396 + 40 / 2;
        const yNext = 1075 + 139 / 2 + fontSize / 2;
        this.context.fillText(nextLvl, xNext, yNext);
    }

    private _drawExpBar(currentExperience: number, requiredExperience: number) {
        const startX = 142.55;
        const startY = 1274.54;
        const barWidth = 2278;
        const lineWidth = 5.44;
        const angle = -0.02;

        const progressRatio = currentExperience / requiredExperience;
        const progressWidth = barWidth * progressRatio;
        const endX = startX + progressWidth;

        this.context.save();
        this.context.strokeStyle = '#8C8C8C';
        this.context.lineWidth = lineWidth;

        this.context.translate(startX, startY);
        this.context.rotate(angle * Math.PI / 180);

        this.context.beginPath();
        this.context.moveTo(0, 0);
        this.context.lineTo(endX - startX, 0);
        this.context.stroke();

        this.context.restore();

        // Рисуем первый круг
        this._drawEllipse(0);
        // Рисуем кружки
        const circleCount = 8;
        for (let i = 0; i < circleCount; i++) {
            const circlePositionX = 324.42 * (i + 1) - 44;
            if (progressWidth >= circlePositionX) {
                this._drawEllipse(324.42 * (i + 1));
            } else {
                break;
            }
        }
    }

    private _drawEllipse(x: number) {
        // задний круг
        this.context.fillStyle = '#0F0F0F';
        this.context.beginPath();
        this.context.arc(144.5457 + x, 1275.5457, 43.5457, 0, Math.PI * 2);
        this.context.fill();

        // средний
        this.context.strokeStyle = 'rgba(255, 255, 255, 0.25)';
        this.context.lineWidth = 4.35457;
        this.context.beginPath();
        this.context.arc(144.5457 + x, 1275.5457, 41.3684, 0, Math.PI * 2);
        this.context.stroke();

        // маленький
        this.context.fillStyle = '#8C8C8C';
        this.context.beginPath();
        this.context.arc(144.5453 + x, 1275.5463, 7.6205, 0, Math.PI * 2);
        this.context.fill();

        this.context.beginPath();
        this.context.arc(144.9615 + x, 1275.5465, 21.0387, 0, Math.PI * 2);
        this.context.fill();
    }

    private async _drawMisc() {
        const image = await loadImage(path.resolve('assets/profile/misc', `${this.user.profile.toLowerCase()}.png`));
        if (this.user.profile === 'CLOUD') {
            this.context.drawImage(image, 0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.context.drawImage(image, 0, 925, 716 / 1.3, 697 / 1.3);
        }
    }
}