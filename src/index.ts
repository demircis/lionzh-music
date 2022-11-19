import * as dotenv from "dotenv";
dotenv.config();
import { readdirSync } from "fs";
import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  SlashCommandBuilder,
} from "discord.js";

// Create a new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
  ],
});

const commandFiles = readdirSync("./src/slash-commands")
  .filter((file) => file.endsWith(".ts"))
  .map((file) => file.split(".")[0]);

export const subscriptions = new Map();

export const slashCommands: Collection<
  string,
  { command: SlashCommandBuilder; execute: Function }
> = new Collection();

for (const file of commandFiles) {
  import(`./slash-commands/${file}`).then((slashCommand) => {
    // Set a new item in the Collection
    // With the key as the command name and the value as the exported module
    slashCommands.set(slashCommand.command.name, {
      command: slashCommand.command,
      execute: slashCommand.execute,
    });
  });
}

const eventFiles = readdirSync("./src/events").filter((file) =>
  file.endsWith(".ts")
);

for (const file of eventFiles) {
  import(`./events/${file}`).then((event) => {
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args));
    } else {
      client.on(event.name, (...args) => event.execute(...args));
    }
  });
}

client.once(Events.ClientReady, (client) => {
  console.log(`Ready! Logged in as ${client.user.tag}`);
});

// Login to Discord with your client's token
client.login(process.env.TOKEN);
