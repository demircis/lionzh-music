import { ChatInputCommandInteraction } from "discord.js";
import { subscriptions } from "..";
import { createInfoMessageEmbed, createQueueEmbed } from "../embedCreator";

import { SlashCommandBuilder } from "@discordjs/builders";

export const command = new SlashCommandBuilder()
  .setName("queue")
  .setDescription("Show up to 5 next tracks in queue.");

export async function execute(interaction: ChatInputCommandInteraction) {
  let subscription = subscriptions.get(interaction.guildId);
  if (!subscription || subscription.queue.length == 0) {
    await interaction.reply({
      embeds: [createInfoMessageEmbed("Queue is empty.")],
      allowedMentions: { repliedUser: false },
    });
  } else {
    const botAvatarURL = interaction.client.user.defaultAvatarURL;
    await interaction.reply({
      embeds: [createQueueEmbed(subscription.queue, botAvatarURL)],
      allowedMentions: { repliedUser: false },
    });
  }
}
