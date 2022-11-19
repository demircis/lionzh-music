import { ChatInputCommandInteraction, Events } from "discord.js";
import { slashCommands } from "..";

export const name = Events.InteractionCreate;

export async function execute(interaction: ChatInputCommandInteraction) {
  if (!interaction.isChatInputCommand()) return;

  const command = slashCommands.get(interaction.commandName);

  if (!command) return;

  try {
    command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({
      content: "There was an error while executing this command!",
      ephemeral: true,
    });
  }
}
