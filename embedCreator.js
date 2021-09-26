const { AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const utilities = require('./utilities');

module.exports = {
    createTrackInfoEmbed(track, queuePos, status) {
        const embed = new MessageEmbed()
        .setAuthor((queuePos == 1 && status != AudioPlayerStatus.Playing) ? 'Now Playing' : 'Added to queue')
        .addField('Track', `**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addField('Length', utilities.secondsToHHMMSS(track.length), true)
        .setTimestamp(new Date())
        .setFooter(`Requested by ${track.requester.username}`, track.requester.displayAvatarURL());
        if (!(queuePos == 1 && status != AudioPlayerStatus.Playing)) {
            embed.addField('Position in queue', queuePos.toString(), true)
        }
        return embed;
    },
    createInfoMessageEmbed(infoMessage) {
        return new MessageEmbed()
        .setColor('#0000ff')
        .setDescription(infoMessage);
    },
    createErrorMessageEmbed(errorMessage) {
        return new MessageEmbed()
        .setColor('#ff0000')
        .setDescription(errorMessage);
    }
}