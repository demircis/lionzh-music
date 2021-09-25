const { SlashCommandBuilder } = require('@discordjs/builders');
const { play } =require('../commandImpl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song specified by given URL!')
        .addStringOption(option =>
            option.setName('url')
            .setDescription('The YouTube URL of your song to play.')
            .setRequired(true)),
	async execute(interaction) {
        let url = interaction.options.get('url').value;
        play(interaction, url);
	}
};
