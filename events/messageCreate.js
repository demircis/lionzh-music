const { play, pause, resume, leave, skip } = require('../commands');
const yts = require('yt-search');

const prefix = '>';

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        if (!message.guild) return;

        if (!message.content.startsWith(prefix) || message.author.bot) return;
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        switch(args[0]) {
            case 'play':
                play(message, args);
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
