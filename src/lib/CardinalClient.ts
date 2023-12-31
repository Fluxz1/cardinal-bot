import { PrismaClient } from '@prisma/client';
import { Enumerable } from '@sapphire/decorators';
import { SapphireClient, container, type SapphirePrefix, type SapphirePrefixHook } from '@sapphire/framework';
import type { Message } from 'discord.js';
import { ClientConfig } from '#config';
import { LongLivingReactionCollector } from '#utils/LongLivingReactionCollector';
import { BotPrefix } from '#constants';

export class CardinalClient<Ready extends boolean = boolean> extends SapphireClient<Ready> {
	@Enumerable(false)
	public override llrCollectors = new Set<LongLivingReactionCollector>();

	public constructor() {
		super(ClientConfig);
	}

	public override async login(token?: string): Promise<string> {
		container.db = new PrismaClient();
		return super.login(token);
	}
	public override destroy(): void {
		return super.destroy();
	}
	public override fetchPrefix: SapphirePrefixHook = async (message: Message): Promise<SapphirePrefix> => {
		if (!message.guild) return BotPrefix;
		const data = await container.db.guild.findUnique({
			where: {
				guildId: message.guild.id
			}
		});
		if (!data) return BotPrefix;
		return data.prefix;
	};
}
