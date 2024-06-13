import {
    ButtonInteraction,
    CacheType, ChannelSelectMenuInteraction,
    InteractionCollector,
    MentionableSelectMenuInteraction,
    RoleSelectMenuInteraction,
    StringSelectMenuInteraction, UserSelectMenuInteraction
} from 'discord.js';

type CollectorType = InteractionCollector<
    ButtonInteraction<CacheType> |
    StringSelectMenuInteraction<CacheType> |
    UserSelectMenuInteraction<CacheType> |
    RoleSelectMenuInteraction<CacheType> |
    MentionableSelectMenuInteraction<CacheType> |
    ChannelSelectMenuInteraction<CacheType>
>;

export default CollectorType;