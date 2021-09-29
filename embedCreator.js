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
    createQueueEmbed(queue, clientAvatarURL) {
        const titles = queue
				.slice(0, 5)
				.map((track, index) => `${index + 1}) ${track.title}`)
				.join('\n');
        return new MessageEmbed()
        .setAuthor('Queue', clientAvatarURL)
        .addField(queue.length == 1 ? 'Next track' : `Next ${queue.length} tracks`, titles);
    },
    createHelpEmbed(clientAvatarURL, prefix) {
        return new MessageEmbed()
        .setAuthor('LionZH Music commands', clientAvatarURL)
        .addFields(
            { name: `${prefix}play`, value: `Plays a track from YouTube.\nExamples:\n${prefix}play michael jackson billie jean\n${prefix}play https://www.youtube.com/watch?v=dQw4w9WgXcQ` },
            { name: `${prefix}pause`, value: 'Pauses the current track.' },
            { name: `${prefix}resume`, value: 'Resumes the current track.' },
            { name: `${prefix}skip`, value: 'Skips to the next track in queue.' },
            { name: `${prefix}leave`, value: 'Leaves the voice channel.' },
            { name: `${prefix}prefix`, value: 'Changes the prefix to a new one (Only possible for Administrators).' }
        );
    },
    createInfoMessageEmbed(infoMessage) {
        return new MessageEmbed()
        .setColor('#2abd62')
        .setDescription(infoMessage);
    },
    createErrorMessageEmbed(errorMessage) {
        return new MessageEmbed()
        .setColor('#ff0000')
        .setDescription(errorMessage);
    }
}