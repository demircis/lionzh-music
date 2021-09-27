const { SlashCommandBuilder } = require('@discordjs/builders');
const { leave } =require('../commands');
const { createInfoMessageEmbed } = require('../embedCreator');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Disconnect the bot from the voice channel.'),
	async execute(interaction) {
        leave(interaction);
		await interaction.reply({ embeds: [createInfoMessageEmbed('Left channel.')]});
	}
};