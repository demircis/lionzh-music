const { SlashCommandBuilder } = require('@discordjs/builders');
const { pause } =require('../commandImpl');
const { createInfoMessageEmbed } = require('../embedCreator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('pause')
		.setDescription('Pause the currently playing track.'),
	async execute(interaction) {
        pause(interaction);
		await interaction.reply({ embeds: [createInfoMessageEmbed('Paused playback.')]});
	}
};