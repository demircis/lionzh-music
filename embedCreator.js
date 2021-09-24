const { AudioPlayerStatus } = require('@discordjs/voice');
const { MessageEmbed } = require('discord.js');
const utilities = require('./utilities');

module.exports = {
    createTrackInfoEmbed(track, queuePos, status) {
        return new MessageEmbed()
        .setAuthor((queuePos == 1 && status != AudioPlayerStatus.Playing) ? 'Now Playing' : 'Added to queue')
        .addField('Track', `**[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .addField('Length', utilities.secondsToHHMMSS(track.length), true)
        .setTimestamp(new Date())
        .setFooter(`Requested by ${track.requester.username}`, track.requester.displayAvatarURL());
    },
    createErrorMessageEmbed(errorMessage) {
        return new MessageEmbed()
        .setColor('#ff0000')
        .setDescription(errorMessage);
    }
}