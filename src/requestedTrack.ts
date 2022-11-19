import { createAudioResource } from "@discordjs/voice";
import { User } from "discord.js";
import ytdl, { getBasicInfo } from "ytdl-core";

const watermark = 1 << 25;

export default class RequestedTrack {
  url: string;
  title: string;
  length: string;
  thumbnail: string;
  requester: User;

  constructor(
    url: string,
    title: string,
    length: string,
    thumbnail: string,
    requester: User
  ) {
    this.url = url;
    this.title = title;
    this.length = length;
    this.thumbnail = thumbnail;
    this.requester = requester;
  }

  async createAudioResource() {
    try {
      const stream = ytdl(this.url, {
        filter: "audioonly",
        highWaterMark: watermark,
      });
      return createAudioResource(stream);
    } catch (error) {
      console.error(error);
    }
  }

  static async from(url: string, requester: User) {
    try {
      const info = await getBasicInfo(url);
      return new RequestedTrack(
        url,
        info.videoDetails.title,
        info.videoDetails.lengthSeconds,
        info.videoDetails.thumbnails[0]["url"],
        requester
      );
    } catch (error) {
      console.error(error);
    }
  }
}
