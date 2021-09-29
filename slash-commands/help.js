const { SlashCommandBuilder } = require('@discordjs/builders');
const { help } = require('../commands');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Show a list of available commands.'),
	async execute(interaction) {
        help(interaction);
	}
};