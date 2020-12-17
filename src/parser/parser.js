
import fetch from "node-fetch";
import { URLL } from "./urll.js";
import { YoutubeSignatureParser } from './signature';
import { YoutubeVideo } from "./youtube-video";
import { getJsonFromUrl, getJsonFromQuery } from "./helper";

class YoutubeParserCache {
  // VARIABLES:
  //   cache;

  constructor() {
    this.cache = {};
  }

  has(videoId) {
    return this._hasVideo(videoId);
  }

  set(videoId, data) {
    this.cache[videoId] = {
      expireAt: 0,
      data: data
    };

    if (data.videos.length) {
      var urlObj = getJsonFromUrl(data.videos[0].url);
      this.cache[videoId].expireAt = parseInt(urlObj.expire);
    }
    return data;
  }

  get(videoId) {
    if (!this._hasVideo(videoId)) return undefined;
    return this.cache[videoId].data;
  }

  _hasVideo(videoId) {
    if (!this.cache[videoId]) return false;

    if (this._isExpired(this.cache[videoId].expireAt)) {
      delete this.cache[videoId];
      return false;
    }

    return true;
  }

  _isExpired(expireAt) {
    const currentTimestamp = Math.floor(Date.now() / 1000);
    // 10 minutes (600 seconds) offest for safe
    return currentTimestamp > expireAt + 600;
  };
}

export class YoutubeParcer {
  // VARIABLES:
  //  videoCache;
  //   signatureParser;

  constructor() {
    this.videoCache = new YoutubeParserCache();
  }

  getVideoData(url) {
    this.signatureParser = new YoutubeSignatureParser();

    return new Promise((fulfill, reject) => {
      var videoId = this._getVideoID(url);

      if (videoId === undefined) {
        reject(new Error('Unable to get video id.'));
        return;
      }

      if (this.videoCache.has(videoId)) {
        fulfill(this.videoCache.get(videoId));
        return;
      }

      this.signatureParser.onError((e) => {
        reject(e);
        return;
      });

      this.signatureParser.onLoad(() => {
        this._fetchMetadata(videoId).then((ytVideoData) => {
          this.videoCache.set(videoId, ytVideoData);
          fulfill(ytVideoData);
        }).catch((e) => {
          reject(e);
        });
      });
    });
  }

  _getVideoID(url) {
    var urlObj = URLL.parseURL(url);
    if (urlObj) {
      return urlObj.hostname === 'youtu.be' ? urlObj.path.slice(1) : urlObj.query.v;
    }
    return undefined;
  }

  _fetchMetadata(videoId) {
    const url = "https://www.youtube.com/get_video_info?video_id=" + videoId + "&asv=3&el=detailpage&hl=en_US";
    return fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })
      .then((response) => response.text())
      .then((response) => {
        const playerResponse = getJsonFromQuery(response).player_response;
        var info = JSON.parse(playerResponse);

        var playable = info.playabilityStatus.status == "OK";
        var videos = playable ? this._parseFormats(info) : [];
        var result = {
          playerResponse: info,
          videos: videos
        };

        return result;
      })
  }

  _parseFormats(info) {
    var formats = [];

    if (info.streamingData.formats) {
      formats = formats.concat(info.streamingData.formats);
    }
    if (info.streamingData.adaptiveFormats) {
      formats = formats.concat(info.streamingData.adaptiveFormats);
    }

    var ytVideos = [];

    formats.forEach((format) => {
      var newFormat = this._parseUrlFromStream(format);
      ytVideos.push(new YoutubeVideo(newFormat));
    });

    return ytVideos;
  }

  _parseUrlFromStream(stream) {
    var url;
    var cipher = stream.cipher;
    if (!cipher) cipher = stream.signatureCipher;

    if (cipher) {
      var dturl = getJsonFromQuery(cipher);
      const signature = this.signatureParser.getSignature(dturl.s);
      url = dturl.url + "&sig=" + signature;
    } else {
      url = stream.url;
    }
    stream.url = url;

    return stream;
  };
}









