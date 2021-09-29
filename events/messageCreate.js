const { play, pause, resume, leave, skip, help, changePrefix } = require('../commands');

var prefix = '>';

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;

        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        switch(args[0]) {
            case 'play':
                await play(message, args);
                return;
            case 'pause':
                await pause(message);
                return;
            case 'resume':
                await resume(message);
                return;
            case 'skip':
                await skip(message);
                return;
            case 'leave':
                await leave(message);
                return;
            case 'prefix':
                const newPrefix = await changePrefix(message, args);
                if (newPrefix) {
                    prefix = newPrefix;
                }
                return;
            case 'help':
                await help(message, prefix);
                return;
            default:
                return;
        }
    }
}
