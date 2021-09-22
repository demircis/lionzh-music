const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration);

module.exports = {
    createEmbed(track) {
        return new MessageEmbed()
        .setColor('#001aff')
        .setTitle(track.title)
        .setAuthor('LionZH Music')
        .setDescription('Now Playing')
        .setURL(track.url)
        .setThumbnail(track.thumbnail)
        .addField('Length', secondsToHHMMSS(track.length), true)
        .setTimestamp(new Date())
        .setFooter(`Requested by ${track.requester.username}`, track.requester.displayAvatarURL());
    }
}

function secondsToHHMMSS(seconds) {
    var milliseconds = parseInt(seconds) * 1000;
    return dayjs.duration(milliseconds).format('HH:mm:ss').replace(/^00:/, '');
}