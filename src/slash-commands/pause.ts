import { ChatInputCommandInteraction } from "discord.js";
import { subscriptions } from "..";
import {
  createErrorMessageEmbed,
  createInfoMessageEmbed,
} from "../embedCreator";

import { SlashCommandBuilder } from "@discordjs/builders";

export const command = new SlashCommandBuilder()
  .setName("pause")
  .setDescription("Pause the currently playing track.");

export async function execute(interaction: ChatInputCommandInteraction) {
  let subscription = subscriptions.get(interaction.guildId);
  if (subscription) {
    subscription.pauseTrack();
    await interaction.reply({
      embeds: [createInfoMessageEmbed("Paused playback.")],
      allowedMentions: { repliedUser: false },
    });
  } else {
    await interaction.reply({
      embeds: [createErrorMessageEmbed("Bot is not playing in this server!")],
      allowedMentions: { repliedUser: false },
    });
  }
}
