const { play, pause, resume, stop, leave } = require('../commandImpl');

const prefix = '>';

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;

        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        switch(args[0]) {
            case 'play':
                if (args.length > 1 && args[1].startsWith('https://www.youtube.com')) {
                    let url = args[1];
                    play(message, url);
                }
                return;
            case 'pause':
                pause(message.guildId);
                return;
            case 'resume':
                resume(message.guildId);
                return;
            case 'stop':
                stop(message.guildId);
                return;
            case 'leave':
                leave(message.guildId);
                return;
            default:
                return;
        }
    }
}
