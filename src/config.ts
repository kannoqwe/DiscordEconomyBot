import { ButtonStyle } from 'discord.js';

export default {
    prefix: '!',
    token: 'OTg4MTc4MDc5MDUyNjA3NTI4.GVXQYQ.tm2sY37c6ipVdTK1AS8WVGi841SoTQVyO_W6Iw',

    // Айди сервера
    guild: '1042175247241191584',

    developers: ['393722994393874441'],

    database : {
        host: '62.109.11.15',
        port: 3306,
        database: 'ever',
        username: 'kannoqwe',
        password: 'qwekannozxc'
    },

    emoji: {
        boarder: '> ',
        dot: '・',

        paginator: {
            firstPage: '⏪',
            prevPage: '◀️',
            delete: '🧺',
            nextPage: '▶️',
            lastPage: '⏩'
        },

        transactions: {
            award: '➕',
            withdraw: '➖'
        }
    },

    // Цвета эмпедов
    colors: {
        main: 0x2b2d31,
        error: 0xff8080
    },

    // Канала для команд, пусто если во всех каналах, обязательно хоть один элемент должен быть внутри
    commandsChannel: [''],

    confirmation: {
        accept: {
            emoji: '✔️',
            color: ButtonStyle.Secondary
        },
        decline: {
            emoji: '✖️',
            color: ButtonStyle.Secondary
        }
    },

    currency: {
        wallet: {
            name: 'Монеты',
            emoji: ':coin:'
        },
        donate: {
            name: 'Донаты',
            emoji: ':coin:'
        },

        // Временная награда
        timely: {
            amount: 50,
            delay: 6 * 3600
        },

        // Передача валюты
        give: {
            // Минимум можно передать
            min: 50,
            // Коммисия при передачи валюты в процентах
            commission: 7
        },
        
        games: {
            // мин ставка
            min: 50,
            // макс ставка
            max: 5000,
            // комиссия
            commission: 7,
            // Время через сколько отменяется игра
            timestamp: 3600
        }
    },

    personalRoles: {
        // Цена создания
        price: 5000,
        // Налог (Раз в месяц)
        tax: 5000,
        // Процент, идущий владельцу после покупки роли, это 25%
        purchasePercent: 0.25,
        // Минимальная цена в магазине
        minPrice: 500,
        // Максимальная цена в магазине
        maxPrice: 100000,
        prices: {
            give: 200,
            take: 200,
            edit: 500
        },
        // Лимит личных ролей у пользователя
        limit: 5
    },

    roles: {
        parents: {
            // Выше этой роли создаются личные роли
            personalRoles: '1042183170155622401'
        }
    },

    staff: [
        { type: 'ADMIN', id: '1042179657090465832' },
        { type: 'CURATOR', id: '1042179661666451456' },
        { type: 'MASTER', id: '1042179661666451456' },
        { type: 'MOD', id: '' },
        { type: 'EVENT_MAKER', id: '1042179660810834011' },
        { type: 'CLOSE_MAKER', id: '1042179660810834011' },
        { type: 'SUPPORT', id: '' }
    ],

    channels: {
        logs: '1122470939964211270',
        personalRoles: '1122470939964211270'
    },

    gifs: {
        // Решка
        coinflip_tail: 'https://interaction.imgur.com/eZbhjUw.gif',
        // Орел
        coinflip_eagle: 'https://interaction.imgur.com/ZGrjQZw.gif',
        // Дуэль
        duel: 'https://imgur.com/86sL39H.gif'
    }
};