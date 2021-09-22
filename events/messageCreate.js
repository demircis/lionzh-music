const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');
const { createEmbed } = require('../utilities');

const prefix = '>';
const BOT_TIMEOUT = 60000;
const WATERMARK = 1 << 25;

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;

        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        console.log(args);
        switch(args[0]) {
            case 'play':
                if (args.length > 1 && args[1].startsWith('https://www.youtube.com')) {
                    let voiceChannel = message.member.voice.channel;
                    if (!voiceChannel) {
                        message.reply('You need to be in a voice channel first!');
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
                    let url = args[1];
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
                    const embed = createEmbed(videoDetails, message.author.username, message.author.displayAvatarURL());
                    message.channel.send({ embeds: [embed] });
                }
            default:
                return;
        }
    }
}
