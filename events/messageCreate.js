const { play, pause, resume, stop, leave } = require('../commandImpl');
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
                await message.reply({ embeds: [createInfoMessageEmbed('Paused playback.')], allowedMentions: {repliedUser: false} });
                return;
            case 'resume':
                resume(message);
                await message.reply({ embeds: [createInfoMessageEmbed('Resumed playback.')], allowedMentions: {repliedUser: false} });
                return;
            case 'stop':
                stop(message);
                await message.reply({ embeds: [createInfoMessageEmbed('Stopped playback (track removed).')], allowedMentions: {repliedUser: false} });
                return;
            case 'leave':
                leave(message);
                await message.reply({ embeds: [createInfoMessageEmbed('Left channel.')], allowedMentions: {repliedUser: false} });
                return;
            default:
                return;
        }
    }
}
