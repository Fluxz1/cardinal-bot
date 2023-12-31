import { BucketScope, LogLevel, type ClientLoggerOptions, type CooldownOptions, type SapphirePrefix } from '@sapphire/framework';
import type { ScheduledTaskHandlerOptions } from '@sapphire/plugin-scheduled-tasks';
import type { RedisOptions } from 'bullmq';
import { ActivityType, GatewayIntentBits, Partials, type ClientOptions, type MessageMentionOptions, type PresenceData } from 'discord.js';
import { BotPrefix, CooldownFiltered } from '#constants';
import { envParseNumber, envParseString } from '@skyra/env-utilities';
import { seconds } from '#utils/common';

export const Presence = {
	activities: [{ name: `for ${BotPrefix}help`, type: ActivityType.Watching }],
	status: 'online'
} as PresenceData;

export function parseRedisOption(): Pick<RedisOptions, 'port' | 'password' | 'host'> {
	return {
		port: envParseNumber('REDIS_PORT'), // TODO: Get a new redis database
		password: envParseString('REDIS_PASSWORD'),
		host: envParseString('REDIS_HOST')
	};
}

export const config: Config = {
	default_prefix: BotPrefix,
	intents: [
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.DirectMessageReactions,
		GatewayIntentBits.DirectMessageTyping
	],
	cooldown_options: {
		delay: seconds(5),
		filteredUsers: CooldownFiltered,
		scope: BucketScope.User
	},
	mentions: {
		parse: ['users'],
		repliedUser: false
	},
	partials: [Partials.GuildMember, Partials.Message, Partials.User, Partials.Channel],
	logger: {
		level: LogLevel.Debug
	},

	presence: Presence,
	tasks: {
		bull: { connection: parseRedisOption() }
	}
};

export const ClientConfig: ClientOptions = {
	intents: config.intents,
	defaultPrefix: config.default_prefix,
	allowedMentions: config.mentions,
	caseInsensitiveCommands: true,
	caseInsensitivePrefixes: true,
	defaultCooldown: config.cooldown_options,
	partials: config.partials,
	logger: config.logger,
	loadMessageCommandListeners: true,
	typing: false,
	disableMentionPrefix: false,
	preventFailedToFetchLogForGuilds: true,
	presence: config.presence,
	tasks: config.tasks
};

interface Config {
	intents: GatewayIntentBits[];
	cooldown_options: CooldownOptions;
	mentions: MessageMentionOptions;
	partials: Partials[];
	logger: ClientLoggerOptions;
	presence: PresenceData;
	default_prefix: SapphirePrefix;
	tasks: ScheduledTaskHandlerOptions;
}
