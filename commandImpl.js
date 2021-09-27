const { Interaction, GuildMember } = require("discord.js");
const { joinVoiceChannel, entersState, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const MusicSubscription = require('./musicSubscription');
const RequestedTrack = require('./requestedTrack');
const embedCreator = require('./embedCreator');

const subscriptions = new Map();
const idleTimeout = 60e3;

module.exports = {
    async play(command, url) {
        let requester = command instanceof Interaction ? command.user : command.author;
        let subscription = subscriptions.get(command.guildId);
        if (!subscription) {
            let voiceChannel = command.member.voice.channel;
            if (!voiceChannel) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')], allowedMentions: {repliedUser: false} });
                return;
            }
            if (!command.member instanceof GuildMember) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')], allowedMentions: {repliedUser: false} });
                return;
            }
            subscription = new MusicSubscription(joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            }));
            subscription.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
                try {
                    await entersState(subscription.audioPlayer, AudioPlayerStatus.Playing, idleTimeout);
                } catch {
                    if (subscription.voiceConnection.state.status != VoiceConnectionStatus.Destroyed) {
                        subscription.voiceConnection.destroy();
                    }
                    subscriptions.delete(command.guildId);
                }
            });
            subscriptions.set(command.guildId, subscription);
        } else {
            if (subscription && (subscription.voiceConnection.joinConfig.channelId != command.member.voice.channelId)) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is already playing in other channel!')], allowedMentions: {repliedUser: false} });
                return;
            }
        }

        try {
            await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 5000);
        } catch(error) {
            console.log(error);
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Failed to connect to voice channel!')], allowedMentions: {repliedUser: false} });
            return;
        }
        
        const track = await RequestedTrack.from(url, requester);
        const queuePos = await subscription.enqueue(track);
        const playerStatus = subscription.audioPlayer.state.status;
        await command.reply({ embeds: [embedCreator.createTrackInfoEmbed(track, queuePos, playerStatus)], allowedMentions: {repliedUser: false} });
	},
    async pause(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.pauseTrack();
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Paused playback.')], allowedMentions: {repliedUser: false} });
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    },
    async resume(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.resumeTrack();
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Resumed playback.')], allowedMentions: {repliedUser: false} });
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    },
    async skip(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            await subscription.skipTrack();
            const nextTrack = subscription.nextTrack;
            console.log(nextTrack);
            if (!nextTrack) {
                await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Skipped track.')], allowedMentions: {repliedUser: false} });
            } else {
                await command.reply({ embeds: [embedCreator.createInfoMessageEmbed(`Skipped to next track in queue: ${nextTrack.title}.`)], allowedMentions: {repliedUser: false} });
            }
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    },
    async leave(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.voiceConnection.destroy();
            subscriptions.delete(command.guildId);
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Left channel.')], allowedMentions: {repliedUser: false} });
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    }
}