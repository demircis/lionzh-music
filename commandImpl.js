const { Interaction, Message, GuildMember } = require("discord.js");
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const MusicSubscription = require('./musicSubscription');
const RequestedTrack = require('./requestedTrack');
const embedCreator = require('./embedCreator');

const subscriptions = new Map();

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
            subscriptions.set(command.guildId, subscription);
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
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    },
    async resume(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.resumeTrack();
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    },
    async stop(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.stopTrack();
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
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
            return;
        }
    }
}