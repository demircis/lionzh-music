const { SlashCommandBuilder } = require('@discordjs/builders');
const { pause } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the currently playing track.'),
	async execute(interaction) {
        pause(interaction);
	}
};