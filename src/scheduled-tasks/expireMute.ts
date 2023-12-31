import { Modlog } from '#lib/structures';
import { seconds } from '#utils/common';
import { ModerationType } from '#utils/moderationConstants';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';

@ApplyOptions<ScheduledTask.Options>({
	interval: seconds(5),
	enabled: true
})
export class ExpireMuteTask extends ScheduledTask {
	public override async run() {
		const { mute } = this.container.db;
		const now = new Date();
		const mutes = await mute.findMany({
			where: {
				expiresAt: {
					lt: now,
					not: null
				}
			},
			select: { modlog: true, id: true }
		});

		mutes.forEach(async (mute) => {
			await this.container.db.mute.delete({
				where: { id: mute.id }
			});
			const guild = this.container.client.guilds.cache.get(mute.modlog.guildId);
			if (!guild) return;
			const muteRole = guild.roles.cache.find((role) => role.name.toLowerCase() == 'muted');
			if (!muteRole) return;
			const member = guild.members.cache.get(mute.modlog.memberId);
			if (!member) return;
			const staff = guild.members.me ?? (await guild.members.fetchMe());

			await member.roles.remove(muteRole.id);
			const modlog = new Modlog({ member, staff, type: ModerationType.Unmute, reason: 'Mute expired' });
			await modlog.createUnmute();
		});
	}
}
