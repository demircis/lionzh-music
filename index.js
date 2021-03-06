require('dotenv').config();
const fs = require('fs');
const { Client, Intents, Collection } = require('discord.js');
const { eventEmitter, getPrefix } = require('./prefix');

// Create a new client instance
const activity = { name: `${getPrefix()}help`, type: 'LISTENING' };
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_VOICE_STATES, Intents.FLAGS.GUILD_MESSAGES], presence: { activities: [activity] } });

eventEmitter.on('updatePrefix', (newPrefix) => {
	client.user.setPresence({ activities: [{ name: `${newPrefix}help`, type: 'LISTENING' }] });
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./slash-commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./slash-commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// Login to Discord with your client's token
client.login(process.env.TOKEN);
