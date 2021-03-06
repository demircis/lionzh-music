const { SlashCommandBuilder } = require('@discordjs/builders');
const { queue } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('queue')
		.setDescription('Show up to 5 next tracks in queue.'),
	async execute(interaction) {
        await queue(interaction);
	}
};
