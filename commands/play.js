const { SlashCommandBuilder } = require('@discordjs/builders');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const { GuildMember } = require('discord.js');
const MusicSubscription = require('../musicSubscription');
const RequestedTrack = require('../requestedTrack');
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
        const voiceChannel = interaction.member.voice.channel;
        if (!interaction.member instanceof GuildMember || !voiceChannel) {
            await interaction.reply('You need to be in a voice channel first!');
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
        let url = interaction.options.get('url').value;
        const track = await RequestedTrack.from(url, interaction.user);
        subscription.playTrack(await track.createAudioResource());
        const embed = createEmbed(track);
        await interaction.reply({ embeds: [embed] });
	},
};
