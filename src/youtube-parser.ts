import { YoutubeVideoParcer } from "./parser/parser";
import { YoutubeVideoData } from "./parser/youtube-video";

class YoutubeParser {
  youtubeParcer: YoutubeVideoParcer;

  constructor() {
    this.youtubeParcer = new YoutubeVideoParcer();
  }

  async getVideoData(url: string): Promise<YoutubeVideoData> {
    const videoData = await this.youtubeParcer.getVideoData(url);
    return videoData;
  }
}

module.exports = new YoutubeParser;