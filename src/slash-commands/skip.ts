import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { subscriptions } from "..";
import {
  createErrorMessageEmbed,
  createInfoMessageEmbed,
} from "../embedCreator";

export const command = new SlashCommandBuilder()
  .setName("skip")
  .setDescription("Skip to the next track in queue.");

export async function execute(interaction: ChatInputCommandInteraction) {
  let subscription = subscriptions.get(interaction.guildId);
  if (subscription) {
    await subscription.skipTrack();
    const nextTrack = subscription.nextTrack;
    if (!nextTrack) {
      await interaction.reply({
        embeds: [createInfoMessageEmbed("Skipped track.")],
        allowedMentions: { repliedUser: false },
      });
    } else {
      await interaction.reply({
        embeds: [
          createInfoMessageEmbed(
            `Skipped to next track in queue: ${nextTrack.title}.`
          ),
        ],
        allowedMentions: { repliedUser: false },
      });
    }
  } else {
    await interaction.reply({
      embeds: [createErrorMessageEmbed("Bot is not playing in this server!")],
      allowedMentions: { repliedUser: false },
    });
  }
}
