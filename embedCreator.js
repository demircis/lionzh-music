const { MessageEmbed } = require('discord.js');
const utilities = require('./utilities');

module.exports = {
    createTrackInfoEmbed(track) {
        return new MessageEmbed()
        .setAuthor('Now Playing')
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