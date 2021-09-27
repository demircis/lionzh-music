const { SlashCommandBuilder } = require('@discordjs/builders');
const { pause } =require('../commands');
const { createInfoMessageEmbed } = require('../embedCreator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('skip')
		.setDescription('Skip to the next track in queue.'),
	async execute(interaction) {
        pause(interaction);
		await interaction.reply({ embeds: [createInfoMessageEmbed('Skipped track.')] });
	}
};