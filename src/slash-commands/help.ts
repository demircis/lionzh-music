import { SlashCommandBuilder } from "@discordjs/builders";
import { ChatInputCommandInteraction } from "discord.js";
import { createHelpEmbed } from "../embedCreator";

export const command = new SlashCommandBuilder()
  .setName("help")
  .setDescription("Show a list of available commands.");

export async function execute(interaction: ChatInputCommandInteraction) {
  const botAvatarURL = interaction.user.defaultAvatarURL;
  await interaction.reply({
    embeds: [createHelpEmbed(botAvatarURL)],
    allowedMentions: { repliedUser: false },
  });
}
