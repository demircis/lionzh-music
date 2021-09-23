const { Interaction, Message, GuildMember } = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const MusicSubscription = require('./musicSubscription');
const RequestedTrack = require('./requestedTrack');
const embedCreator = require('./embedCreator');

module.exports = {
    async play(command, url) {
        var requester = null;
        const voiceChannel = command.member.voice.channel;
        if (command instanceof Interaction) {
            var interaction = command;
            requester = interaction.user;
            if (!voiceChannel) {
                await interaction.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')] });
                return;
            }
            if (!interaction.member instanceof GuildMember) {
                await interaction.reply({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')] });
            }
        } else if (command instanceof Message) {
            var message = command;
            requester = message.author;
            if (!voiceChannel) {
                message.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')] });
                return;
            }
            if (!message.member instanceof GuildMember) {
                message.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')] });
            }
        }
        const connection = getVoiceConnection(voiceChannel.guild.id);
        if (!connection) {
            var subscription = new MusicSubscription(joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            }));
        }
        const track = await RequestedTrack.from(url, requester);
        subscription.playTrack(await track.createAudioResource());
        if (command instanceof Interaction) {
            await interaction.reply({ embeds: [embedCreator.createTrackInfoEmbed(track)] });
        } else if (command instanceof Message) {
            message.channel.send({ embeds: [embedCreator.createTrackInfoEmbed(track)] });
        }
	}
}