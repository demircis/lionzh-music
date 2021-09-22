const { MessageEmbed } = require('discord.js');
const dayjs = require('dayjs')
var duration = require('dayjs/plugin/duration')
dayjs.extend(duration);

module.exports = {
    createEmbed(videoDetails, requestedByUser, userAvatar) {
        return new MessageEmbed()
        .setColor('#001aff')
        .setTitle(videoDetails.title)
        .setAuthor('LionZH Music')
        .setDescription('Now Playing')
        .setURL(videoDetails.video_url)
        .setThumbnail(videoDetails.thumbnails[0]['url'])
        .addField('Length', secondsToHHMMSS(videoDetails.lengthSeconds), true)
        .setTimestamp(new Date())
        .setFooter(`Requested by ${requestedByUser}`, userAvatar);
    }
}

function secondsToHHMMSS(seconds) {
    var milliseconds = parseInt(seconds) * 1000;
    return dayjs.duration(milliseconds).format('HH:mm:ss').replace(/^00:/, '');
}