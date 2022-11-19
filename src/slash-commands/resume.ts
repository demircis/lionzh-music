import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { subscriptions } from "..";
import {
  createErrorMessageEmbed,
  createInfoMessageEmbed,
} from "../embedCreator";

export const command = new SlashCommandBuilder()
  .setName("resume")
  .setDescription("Resume the currently paused track.");

export async function execute(interaction: ChatInputCommandInteraction) {
  let subscription = subscriptions.get(interaction.guildId);
  if (subscription) {
    subscription.resumeTrack();
    await interaction.reply({
      embeds: [createInfoMessageEmbed("Resumed playback.")],
      allowedMentions: { repliedUser: false },
    });
  } else {
    await interaction.reply({
      embeds: [createErrorMessageEmbed("Bot is not playing in this server!")],
      allowedMentions: { repliedUser: false },
    });
  }
}
