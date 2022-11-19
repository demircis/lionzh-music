import { SlashCommandBuilder } from "@discordjs/builders";
import {
  AudioPlayerStatus,
  entersState,
  joinVoiceChannel,
  VoiceConnectionStatus,
} from "@discordjs/voice";
import {
  ChatInputCommandInteraction,
  GuildMember,
  VoiceBasedChannel,
} from "discord.js";
import yts from "yt-search";
import { subscriptions } from "..";
import { createErrorMessageEmbed, createTrackInfoEmbed } from "../embedCreator";
import MusicSubscription from "../musicSubscription";
import RequestedTrack from "../requestedTrack";

const idleTimeout = 300e3;

export const command = new SlashCommandBuilder()
  .setName("play")
  .setDescription("Enter the YouTube URL or the song title.")
  .addStringOption((option) =>
    option
      .setName("query")
      .setDescription("The YouTube URL or the title of your song to play.")
      .setRequired(true)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  interaction.deferReply();
  const option = interaction.options.getString("query");
  const args = option?.trim().split(/ +/) ?? [];
  const requester = interaction.user;
  let subscription: MusicSubscription = subscriptions.get(interaction.guildId);
  if (!subscription) {
    const voiceChannel = (interaction.member as GuildMember)?.voice.channel;
    if (!voiceChannel) {
      await interaction.editReply({
        embeds: [
          createErrorMessageEmbed("You need to be in a voice channel first!"),
        ],
        allowedMentions: { repliedUser: false },
      });
      return;
    }
    if (!(interaction.member instanceof GuildMember)) {
      await interaction.editReply({
        embeds: [
          createErrorMessageEmbed("You are not a member of this server!"),
        ],
        allowedMentions: { repliedUser: false },
      });
      return;
    }
    subscription = createAndSetupMusicSubscription(
      voiceChannel,
      interaction.guildId
    );
    subscriptions.set(interaction.guildId, subscription);
  } else {
    if (
      subscription &&
      subscription.voiceConnection.joinConfig.channelId !=
        (interaction.member as GuildMember)?.voice.channelId
    ) {
      await interaction.editReply({
        embeds: [
          createErrorMessageEmbed("Bot is already playing in other channel!"),
        ],
        allowedMentions: { repliedUser: false },
      });
      return;
    }
  }

  try {
    await entersState(
      subscription.voiceConnection,
      VoiceConnectionStatus.Ready,
      5000
    );
  } catch (error) {
    console.log(error);
    await interaction.editReply({
      embeds: [createErrorMessageEmbed("Failed to connect to voice channel!")],
      allowedMentions: { repliedUser: false },
    });
    return;
  }

  const query = await obtainVideoUrl(args);
  const url = query?.url;
  if (query && !url) {
    await interaction.editReply({
      embeds: [createErrorMessageEmbed(`No videos found for ${query.search}!`)],
      allowedMentions: { repliedUser: false },
    });
    return;
  } else if (url) {
    const track = await RequestedTrack.from(url, requester);
    if (track) {
      const queuePos = await subscription.enqueue(track);
      const playerStatus = subscription.audioPlayer.state.status;
      await interaction.editReply({
        embeds: [createTrackInfoEmbed(track, queuePos, playerStatus)],
        allowedMentions: { repliedUser: false },
      });
    }
  }
}

function createAndSetupMusicSubscription(
  voiceChannel: VoiceBasedChannel,
  guildId: string | null
): MusicSubscription {
  const subscription = new MusicSubscription(
    joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: voiceChannel.guild.id,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    })
  );
  subscription.audioPlayer.on(AudioPlayerStatus.Idle, async () => {
    try {
      await entersState(
        subscription.audioPlayer,
        AudioPlayerStatus.Playing,
        idleTimeout
      );
    } catch {
      if (
        subscription.voiceConnection.state.status !=
        VoiceConnectionStatus.Destroyed
      ) {
        subscription.voiceConnection.destroy();
      }
      subscriptions.delete(guildId);
    }
  });
  return subscription;
}

async function obtainVideoUrl(args: string[]) {
  if (args.length > 0 && args[0].startsWith("https://www.youtube.com")) {
    return { url: args[0], search: undefined };
  } else if (args.length > 0) {
    const search = args.slice(1).join(" ");
    try {
      const r = await yts(search);
      if (r.videos.length > 0) {
        return { url: r.videos[0].url, search: search };
      } else {
        return { url: undefined, search: search };
      }
    } catch (error) {
      console.error(error);
    }
  }
}
