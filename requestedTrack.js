const { createAudioResource } = require('@discordjs/voice');
const ytdl = require('ytdl-core-discord');

const watermark = 1 << 25;

module.exports = class RequestedTrack {
    url;
    title;
    length;
    thumbnail;
    requester;

    constructor(url, title, length, thumbnail, requester) {
        this.url = url;
        this.title = title;
        this.length = length;
        this.thumbnail = thumbnail;
        this.requester = requester;
    }

    async createAudioResource() {
        try {
            const stream = await ytdl(this.url, { filter: 'audioonly', highWaterMark: watermark });
            return createAudioResource(stream);
        } catch(error) {
            console.error(error);
        }
    }

    static async from(url, requester) {
        try {
            const info = await ytdl.getBasicInfo(url);
            return new RequestedTrack(url, info.videoDetails.title, info.videoDetails.lengthSeconds, info.videoDetails.thumbnails[0]['url'], requester);
        } catch(error) {
            console.error(error);
        }
    }
}