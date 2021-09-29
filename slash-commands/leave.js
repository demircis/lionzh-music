const { SlashCommandBuilder } = require('@discordjs/builders');
const { leave } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leave')
		.setDescription('Disconnect the bot from the voice channel.'),
	async execute(interaction) {
        leave(interaction);
	}
};