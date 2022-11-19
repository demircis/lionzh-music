import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { subscriptions } from "..";
import {
  createErrorMessageEmbed,
  createInfoMessageEmbed,
} from "../embedCreator";

export const command = new SlashCommandBuilder()
  .setName("leave")
  .setDescription("Disconnect the bot from the voice channel.");

export async function execute(interaction: ChatInputCommandInteraction) {
  let subscription = subscriptions.get(interaction.guildId);
  if (subscription) {
    subscription.voiceConnection.destroy();
    subscriptions.delete(interaction.guildId);
    await interaction.reply({
      embeds: [createInfoMessageEmbed("Left channel.")],
      allowedMentions: { repliedUser: false },
    });
  } else {
    await interaction.reply({
      embeds: [createErrorMessageEmbed("Bot is not playing in this server!")],
      allowedMentions: { repliedUser: false },
    });
  }
}
