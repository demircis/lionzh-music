const { SlashCommandBuilder } = require('@discordjs/builders');
const { stop } =require('../commandImpl');
const { createInfoMessageEmbed } = require('../embedCreator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stop')
		.setDescription('Stop and delete the currently playing track.'),
	async execute(interaction) {
        stop(interaction);
		await interaction.reply({ embeds: [createInfoMessageEmbed('Stopped playback (track removed).')]});
	}
};