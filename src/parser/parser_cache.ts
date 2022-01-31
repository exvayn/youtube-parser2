import { getJsonFromUrl } from "./helper";
import { YoutubeVideoData } from "./youtube-video";

interface YoutubeVideoDataCache {
  expireAt: number,
  data: YoutubeVideoData
}

export class YoutubeParserCache {
  private cache: {
    [videoId: string]: YoutubeVideoDataCache
  };

  constructor() {
    this.cache = {};
  }

  has(videoId: string): boolean {
    return this.hasVideo(videoId);
  }

  set(videoId: string, data: YoutubeVideoData): YoutubeVideoData {
    this.cache[videoId] = {
      expireAt: 0,
      data: data
    };

    if (data.videos.length) {
      let urlObj = getJsonFromUrl(data.videos[0].url);
      this.cache[videoId].expireAt = parseInt(urlObj.expire);
    }
    return data;
  }

  get(videoId: string): YoutubeVideoData {
    if (!this.hasVideo(videoId)) return undefined;
    return this.cache[videoId].data;
  }

  private hasVideo(videoId: string): boolean {
    if (!this.cache[videoId]) return false;

    if (this.isExpired(this.cache[videoId])) {
      delete this.cache[videoId];
      return false;
    }

    return true;
  }

  private isExpired(videoCache: YoutubeVideoDataCache): boolean {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // 10 minutes (600 seconds) offest for safe
    return currentTimestamp > videoCache.expireAt + 600;
  };
}