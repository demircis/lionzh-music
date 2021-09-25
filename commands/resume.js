const { SlashCommandBuilder } = require('@discordjs/builders');
const { resume } =require('../commandImpl');
const { createInfoMessageEmbed } = require('../embedCreator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('resume')
		.setDescription('Resume the currently paused track.'),
	async execute(interaction) {
        resume(interaction);
		await interaction.reply({ embeds: [createInfoMessageEmbed('Resumed playback.')]});
	}
};