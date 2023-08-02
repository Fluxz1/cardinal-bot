import { CardinalEmbedBuilder, ModerationCommand, Modlog } from '#lib/structures';
import { ModerationType } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { send } from '@sapphire/plugin-editable-commands';

@ApplyOptions<ModerationCommand.Options>({
	description: 'Warn a member',
	name: 'warn',
	detailedDescription: {
		extendedHelp: 'Warn a member',
		usages: ['User Reason'],
		examples: ['@Jigglepuff Spam']
	}
})
export class warnCommand extends ModerationCommand {
	public override async messageRun(message: ModerationCommand.Message, args: ModerationCommand.Args) {
		const target = await args.pick('member').catch(() => null);

		if (!target) {
			return send(message, {
				embeds: [new CardinalEmbedBuilder().setStyle('fail').setDescription('Provide a valid member to warn')]
			});
		}

		const reason = await args.rest('string').catch(() => null);

		if (!reason) {
			return send(message, {
				embeds: [new CardinalEmbedBuilder().setStyle('fail').setDescription('Provide a valid reason')]
			});
		}

		const modlog = new Modlog({ member: target, staff: message.member, reason, type: ModerationType.Warn });
		await modlog.createWarn();

		return send(message, {
			embeds: [new CardinalEmbedBuilder().setStyle('success').setDescription(`Warned ${target.user.username} | ${reason}`)]
		});
	}
}