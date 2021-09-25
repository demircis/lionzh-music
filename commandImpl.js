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
            if (command instanceof Interaction) {
                let interaction = command;
                if (!voiceChannel) {
                    await interaction.reply({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')] });
                    return;
                }
                if (!interaction.member instanceof GuildMember) {
                    await interaction.reply({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')] });
                    return;
                }
            } else if (command instanceof Message) {
                let message = command;
                if (!voiceChannel) {
                    message.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('You need to be in a voice channel first!')] });
                    return;
                }
                if (!message.member instanceof GuildMember) {
                    message.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('You are not a member of this server!')] });
                    return;
                }
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
            if (command instanceof Interaction) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Failed to connect to voice channel!')] });
                return;
            } else if (command instanceof Message) {
                command.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('Failed to connect to voice channel!')] });
                return;
            }
        }
        
        const track = await RequestedTrack.from(url, requester);
        const queuePos = await subscription.enqueue(track);
        const playerStatus = subscription.audioPlayer.state.status;
        if (command instanceof Interaction) {
            await command.reply({ embeds: [embedCreator.createTrackInfoEmbed(track, queuePos, playerStatus)] });
        } else if (command instanceof Message) {
            command.channel.send({ embeds: [embedCreator.createTrackInfoEmbed(track, queuePos, playerStatus)] });
        }
	},
    async pause(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.pauseTrack();
        } else {
            if (command instanceof Interaction) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            } else if (command instanceof Message) {
                command.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            }
        }
    },
    async resume(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.resumeTrack();
        } else {
            if (command instanceof Interaction) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            } else if (command instanceof Message) {
                command.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            }
        }
    },
    async stop(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.stopTrack();
        } else {
            if (command instanceof Interaction) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            } else if (command instanceof Message) {
                command.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            }
        }
    },
    async leave(command) {
        let subscription = subscriptions.get(command.guildId);
        if (subscription) {
            subscription.voiceConnection.destroy();
            subscriptions.delete(command.guildId);
        } else {
            if (command instanceof Interaction) {
                await command.reply({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            } else if (command instanceof Message) {
                command.channel.send({ embeds: [embedCreator.createErrorMessageEmbed('Bot is not playing in this server!')] });
                return;
            }
        }
    }
}