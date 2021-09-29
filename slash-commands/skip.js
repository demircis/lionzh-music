const { SlashCommandBuilder } = require('@discordjs/builders');
const { pause } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip to the next track in queue.'),
	async execute(interaction) {
        pause(interaction);
	}
};