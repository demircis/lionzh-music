import { AudioPlayerStatus } from "@discordjs/voice";
import { EmbedBuilder } from "discord.js";
import RequestedTrack from "./requestedTrack";
import { secondsToHHMMSS } from "./utilities";

export function createTrackInfoEmbed(
  track: RequestedTrack,
  queuePos: number,
  status: AudioPlayerStatus
) {
  const embed = new EmbedBuilder()
    .setAuthor({
      name:
        queuePos == 1 && status != AudioPlayerStatus.Playing
          ? "Now Playing"
          : "Added to queue",
    })
    .addFields([
      { name: "Track", value: `**[${track.title}](${track.url})**` },
      { name: "Length", value: secondsToHHMMSS(track.length) },
    ])
    .setThumbnail(track.thumbnail)
    .setTimestamp(new Date())
    .setFooter({
      text: `Requested by ${track.requester.username}`,
      iconURL: track.requester.displayAvatarURL(),
    });
  if (!(queuePos == 1 && status != AudioPlayerStatus.Playing)) {
    embed.addFields([
      { name: "Position in queue", value: queuePos.toString() },
    ]);
  }
  return embed;
}

export function createQueueEmbed(
  queue: RequestedTrack[],
  clientAvatarURL: string
) {
  const titles = queue
    .slice(0, 5)
    .map((track, index) => `${index + 1}) ${track.title}`)
    .join("\n");
  return new EmbedBuilder()
    .setAuthor({ name: "Queue", url: clientAvatarURL })
    .addFields([
      {
        name: queue.length == 1 ? "Next track" : `Next ${queue.length} tracks`,
        value: titles,
      },
    ]);
}

export function createHelpEmbed(clientAvatarURL: string) {
  return new EmbedBuilder()
    .setAuthor({ name: "LionZH Music commands", url: clientAvatarURL })
    .addFields(
      {
        name: `/play`,
        value: `Plays a track from YouTube.\nExamples:\n/play michael jackson billie jean\n/play https://www.youtube.com/watch?v=dQw4w9WgXcQ`,
      },
      { name: `/pause`, value: "Pauses the current track." },
      { name: `/resume`, value: "Resumes the current track." },
      { name: `/skip`, value: "Skips to the next track in queue." },
      { name: `/queue`, value: "Show up to 5 next tracks in queue." },
      { name: `/leave`, value: "Leaves the voice channel." }
    );
}

export function createInfoMessageEmbed(infoMessage: string) {
  return new EmbedBuilder().setColor("#2abd62").setDescription(infoMessage);
}

export function createErrorMessageEmbed(errorMessage: string) {
  return new EmbedBuilder().setColor("#ff0000").setDescription(errorMessage);
}
