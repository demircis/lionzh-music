const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { createEmbed } = require('../utilities');

const BOT_TIMEOUT = 60000;
const WATERMARK = 1 << 25;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('play')
		.setDescription('Plays a song specified by given URL!')
        .addStringOption(option =>
            option.setName('url')
            .setDescription('The YouTube URL of your song to play.')
            .setRequired(true)),
	async execute(interaction) {
        let voiceChannel = interaction.member.voice.channel;
        if (!voiceChannel) {
            await interaction.reply('You need to be in a voice channel first!');
            return;
        }
        let connection = getVoiceConnection(voiceChannel.guild.id);
        if (!connection) {
            connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });
        } else {
            console.log(`Already connected to channel ${voiceChannel.name}!`)
        }
        connection.on('stateChange', (oldState, newState) => {
            console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        });
        let url = interaction.options.get('url').value;
        const stream = await ytdl(url, { filter: 'audioonly', highWaterMark: WATERMARK });
        const videoInfo = await ytdl.getBasicInfo(url);
        const videoDetails = videoInfo.videoDetails;
        const resource = createAudioResource(stream);
        const player = createAudioPlayer();
        player.on('error', error => {
            console.error(error.stack);
        });
        player.on('stateChange', (oldState, newState) => {
            console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
        });
        player.on(AudioPlayerStatus.Idle, () => setTimeout(() => connection.destroy(), BOT_TIMEOUT));
        player.play(resource);
        connection.subscribe(player);
        const embed = createEmbed(videoDetails, interaction.user.username, interaction.user.displayAvatarURL());
        await interaction.reply({ embeds: [embed] });
	},
};
