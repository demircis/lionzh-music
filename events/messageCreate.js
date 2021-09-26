const { play, pause, resume, stop, leave, skip } = require('../commandImpl');
const { createInfoMessageEmbed } = require('../embedCreator');

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
                pause(message);
                return;
            case 'resume':
                resume(message);
                return;
            case 'skip':
                skip(message);
                return;
            case 'leave':
                leave(message);
                return;
            default:
                return;
        }
    }
}
