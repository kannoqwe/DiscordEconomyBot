# Discord Economy Bot

A modular Discord bot for managing virtual economy on Discord servers. Built with TypeScript, Discord.js v14, and TypeORM.

## Features

- **Economy System** - Virtual wallet and donate currency, balance checking, currency transfers with commission
- **Daily Rewards** - Timely command for periodic coin rewards
- **Transaction History** - Full transaction logging with types (awards, withdrawals, transfers)
- **Gambling Games** - Coinflip and Duel games with configurable stakes and commission
- **Personal Roles** - Create, manage, and trade custom roles with marketplace functionality
- **Marriage System** - Create couples with love rooms and monthly tax
- **User Profiles** - Customizable profiles with levels, experience, frames and canvas rendering
- **Leaderboards** - Track top users by balance

## Tech Stack

- TypeScript
- Discord.js v14
- TypeORM + MySQL
- @napi-rs/canvas (profile rendering)
- node-cron (scheduled tasks)

## Requirements

- Node.js 18+
- MySQL database

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kannoqwe/DiscordEconomyBot.git
   cd DiscordEconomyBot
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Configure `src/config.ts` with your bot token, database credentials, and other settings

4. Build and run:
   ```bash
   yarn build
   node dist/index.js
   ```

## Configuration

Edit `src/config.ts` to set:

- Bot token and prefix
- Database connection (host, port, username, password)
- Currency settings (names, timely rewards, commission rates)
- Game limits (min/max bets, commission)
- Personal roles pricing and limits
- Staff role IDs
- Channel IDs for logs

## Scripts

| Command | Description |
|---------|-------------|
| `yarn dev` | Build and run in development mode |
| `yarn build` | Compile TypeScript to JavaScript |
| `yarn lint` | Run ESLint |
| `yarn lint:fix` | Fix ESLint issues automatically |

## Commands

### Economy
- `/balance [user]` - Check user balance
- `/give <user> <amount>` - Transfer currency to another user
- `/timely` - Claim periodic reward
- `/transactions` - View transaction history

### Games
- `/coinflip <amount>` - Play coinflip game
- `/duel <user> <amount>` - Challenge user to a duel

### Personal Roles
- `/role create <name> <color>` - Create a personal role
- `/role info <role>` - View role information
- `/role manage` - Manage your personal roles

### Love
- `/marry <user>` - Propose marriage to a user

### Misc
- `/profile [user]` - View user profile

### Admin
- `/award <user> <amount>` - Award currency to a user
- `/guild` - Guild settings

## Project Structure

```
src/
├── classes/          # Business logic classes
├── commands/         # Slash commands by category
├── entities/         # TypeORM database entities
├── events/           # Discord event handlers
├── modules/          # Reusable modules
├── structure/        # Core bot structure and utilities
├── types/            # TypeScript type definitions
├── config.ts         # Bot configuration
└── index.ts          # Entry point
```

## License

MIT kannoqwe