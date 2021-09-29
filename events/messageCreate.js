const { play, pause, resume, leave, skip, help, changePrefix, queue } = require('../commands');
const { getPrefix, setPrefix } = require('../prefix');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;

        const prefix = getPrefix();
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
            case 'queue':
                await queue(message);
                return;
            case 'prefix':
                const newPrefix = await changePrefix(message, args);
                if (newPrefix) {
                    setPrefix(newPrefix);
                }
                return;
            case 'help':
                await help(message);
                return;
            default:
                return;
        }
    }
}
