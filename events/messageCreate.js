const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { GuildMember } = require('discord.js');
const MusicSubscription = require('../musicSubscription');
const RequestedTrack = require('../requestedTrack');
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
        switch(args[0]) {
            case 'play':
                if (args.length > 1 && args[1].startsWith('https://www.youtube.com')) {
                    const voiceChannel = message.member.voice.channel;
                    if (!message.member instanceof GuildMember || !voiceChannel) {
                        message.reply('You need to be in a voice channel first!');
                        return;
                    }
                    const connection = getVoiceConnection(voiceChannel.guild.id);
                    if (!connection) {
                        var subscription = new MusicSubscription(joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: voiceChannel.guild.id,
                            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
                        }));
                    }
                    let url = args[1];
                    const track = await RequestedTrack.from(url, message.author);
                    subscription.playTrack(await track.createAudioResource());
                    const embed = createEmbed(track);
                    message.channel.send({ embeds: [embed] });
                }
            default:
                return;
        }
    }
}
