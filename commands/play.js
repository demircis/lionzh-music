const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { MessageEmbed } = require('discord.js');

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
        console.log(interaction.user.username)
        var voiceChannel = interaction.member.voice.channel;
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
        console.log(videoInfo);
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

function createEmbed(videoDetails, requestedByUser, userAvatar) {
    return new MessageEmbed()
	.setColor('#001aff')
	.setTitle(videoDetails.title)
	.setAuthor('LionZH Music')
	.setDescription('Now Playing')
    .setURL(videoDetails.video_url)
	.setThumbnail(videoDetails.thumbnails[0]['url'])
	.addField('Length', secondsToHHMMSS(videoDetails.lengthSeconds), true)
    .setTimestamp(new Date())
	.setFooter(`Requested by ${requestedByUser}`, userAvatar);
}

function secondsToHHMMSS(secondsStr) {
    var secondsInt = parseInt(secondsStr);
    var hours = Math.floor(secondsInt / 3600);
    var minutes = Math.floor(secondsInt / 60) % 60;
    var seconds = secondsInt % 60;

    if (hours > 0) {
        return `${hours}:${minutes}:${seconds}`;
    } else if (minutes > 0) {
        return `${minutes}:${seconds}`
    } else {
        return `${seconds}`
    }
}
