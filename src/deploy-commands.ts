import * as dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { SlashCommandBuilder } from "discord.js";

const commands: SlashCommandBuilder[] = [];
const commandFiles = fs
  .readdirSync("./src/slash-commands")
  .filter((file) => file.endsWith(".ts"));

const collectCommands = async () => {
  for (const file of commandFiles) {
    const slashCommand = await import(`./slash-commands/${file}`);
    commands.push(slashCommand.command.toJSON());
  }
};

const deployCommands = async () => {
  try {
    if (
      process.env.TOKEN &&
      process.env.APPLICATION_ID &&
      process.env.GUILD_ID
    ) {
      const rest = new REST().setToken(process.env.TOKEN);
      await collectCommands();
      await rest.put(
        Routes.applicationGuildCommands(
          process.env.APPLICATION_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
    } else {
      throw new Error("Environment variables not found.");
    }

    console.log("Successfully registered application commands.");
  } catch (error) {
    console.error(error);
  }
};

deployCommands();
