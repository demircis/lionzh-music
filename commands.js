const { Interaction, GuildMember } = require("discord.js");
const { joinVoiceChannel, entersState, VoiceConnectionStatus, AudioPlayerStatus } = require('@discordjs/voice');
const MusicSubscription = require('./musicSubscription');
const RequestedTrack = require('./requestedTrack');
const embedCreator = require('./embedCreator');
const yts = require('yt-search');
const { Permissions } = require('discord.js');

const subscriptions = new Map();
const idleTimeout = 300e3;

module.exports = {
    async play(command, args) {
        const requester = command instanceof Interaction ? command.user : command.author;
        let subscription = subscriptions.get(command.guildId);
        if (!subscription) {
            const voiceChannel = command.member.voice.channel;
            if (!voiceChannel) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')], allowedMentions: {repliedUser: false} });
                return;
            }
            if (!command.member instanceof GuildMember) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')], allowedMentions: {repliedUser: false} });
                return;
            }
            subscription = createAndSetupMusicSubscription(voiceChannel, command.guildId);
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

        const query = await obtainVideoUrl(args);
        const url = query.url;
        if (!url) {
            await message.reply({ embeds: [embedCreator.createErrorMessageEmbed(`No videos found for ${query.search}!`)], allowedMentions: {repliedUser: false} });
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
        }
    },
    async resume(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.resumeTrack();
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Resumed playback.')], allowedMentions: {repliedUser: false} });
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
        }
    },
    async skip(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            await subscription.skipTrack();
            const nextTrack = subscription.nextTrack;
            if (!nextTrack) {
                await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Skipped track.')], allowedMentions: {repliedUser: false} });
            } else {
                await command.reply({ embeds: [embedCreator.createInfoMessageEmbed(`Skipped to next track in queue: ${nextTrack.title}.`)], allowedMentions: {repliedUser: false} });
            }
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')], allowedMentions: {repliedUser: false} });
        }
    },
    async queue(command) {
        let subscription = subscriptions.get(command.guildId);
        if (!subscription || subscription.queue.length == 0) {
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed('Queue is empty.')], allowedMentions: {repliedUser: false} });
        } else {
            const botAvatarURL = command.client.user.defaultAvatarURL;
            await command.reply({ embeds: [embedCreator.createQueueEmbed(subscription.queue, botAvatarURL)], allowedMentions: {repliedUser: false} });
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
        }
    },
    async changePrefix(command, args) {
        if (command.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            if (args.length != 2) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to specify a new, single-word prefix!')], allowedMentions: {repliedUser: false} });
                return null;
            }
            const newPrefix = args[1];
            await command.reply({ embeds: [embedCreator.createInfoMessageEmbed(`Successfully changed prefix to ${newPrefix}`)], allowedMentions: {repliedUser: false} });
            return newPrefix;
        } else {
            await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to be an Administrator to change the prefix!')], allowedMentions: {repliedUser: false} });
            return null;
        }
    },
    async help(command) {
        const botAvatarURL = command.client.user.defaultAvatarURL;
        await command.reply({ embeds: [embedCreator.createHelpEmbed(botAvatarURL)], allowedMentions: {repliedUser: false} });
    }
}

function createAndSetupMusicSubscription(voiceChannel, guildId) {
    const subscription = new MusicSubscription(joinVoiceChannel({
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
            subscriptions.delete(guildId);
        }
    });
    return subscription;
}

async function obtainVideoUrl(args) {
    if (args.length > 1 && args[1].startsWith('https://www.youtube.com')) {
        return args[1];
    } else if (args.length > 1) {
        let search = '';
        args.slice(1).forEach(element => {
            search = search.concat(element, ' ');
        });
        try {
            const r = await yts(search.trimEnd());
            if (r.videos.length > 0) {
                return { url: r.videos[0].url, search: search.trimEnd() };
            } else {
                return null;
            }
        } catch(error) {
            console.error(error);
        }
    }
}