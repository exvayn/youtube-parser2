import { YoutubeVideoData } from "./parser/youtube-video";
import { YoutubeParcer } from "./parser/parser";

class YoutubeParser {
  // VARIABLES:
  //   youtubeParcer;

  constructor() {
    this.youtubeParcer = new YoutubeParcer();
  }

  getVideoData(url) {
    return this.youtubeParcer.getVideoData(url).then((videoData) => {
      return new YoutubeVideoData(videoData.playerResponse ,videoData.videos);
    })
  }
}

module.exports = new YoutubeParser;