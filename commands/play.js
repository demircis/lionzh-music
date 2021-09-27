const { SlashCommandBuilder } = require('@discordjs/builders');
const { play } =require('../commandImpl');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Enter the YouTube URL or the song title.')
        .addStringOption(option =>
            option.setName('query')
            .setDescription('The YouTube URL or the title of your song to play.')
            .setRequired(true)),
	async execute(interaction) {
        const query = interaction.options.get('query').value;
        const args = query.trim().split(/ +/);
        console.log(args);
        play(interaction, args);
	}
};
