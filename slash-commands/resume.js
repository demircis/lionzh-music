const { SlashCommandBuilder } = require('@discordjs/builders');
const { resume } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume the currently paused track.'),
	async execute(interaction) {
        resume(interaction);
	}
};