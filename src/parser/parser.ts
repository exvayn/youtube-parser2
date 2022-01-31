
import fetch from "node-fetch";
import { URLL } from "./urll.js";
import { YoutubeSignatureParser } from './signature';
import { YoutubeVideo } from "./youtube-video";
import { getJsonFromQuery } from "./helper";
import { YoutubeParserCache } from "./parser_cache.js";
import { YoutubeVideoData } from "./youtube-video";

export class YoutubeVideoParcer {
  private videoCache: YoutubeParserCache;
  private signatureParser: YoutubeSignatureParser;

  constructor() {
    this.videoCache = new YoutubeParserCache();
  }

  getVideoData(url: string): Promise<YoutubeVideoData> {
    this.signatureParser = new YoutubeSignatureParser();

    return new Promise((fulfill, reject) => {
      var videoId = this.getVideoID(url);

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
        this.fetchMetadata(videoId).then((ytVideoData) => {
          this.videoCache.set(videoId, ytVideoData);
          fulfill(ytVideoData);
        }).catch((e) => {
          reject(e);
        });
      });
    });
  }

  private getVideoID(url) {
    var urlObj = URLL.parseURL(url);
    if (urlObj) {
      return urlObj.hostname === 'youtu.be' ? urlObj.path.slice(1) : urlObj.query.v;
    }
    return undefined;
  }

  private fetchMetadata(videoId) {
    return fetch('https://www.youtube.com/youtubei/v1/player?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8', {
      method: 'post',
      body: JSON.stringify(this.metadataBody(videoId)),
      headers: {'Content-Type': 'application/json'}
    }).then((response) => response.text())
      .then((response) => {
        var info = JSON.parse(response);

        var playable = info.playabilityStatus.status == "OK";
        var videos = playable ? this.parseFormats(info) : [];
        return new YoutubeVideoData(info, videos);
      })
  }

  private metadataBody(videoId) {
    return {
      context: {
         client: {
            hl: "en",
            clientName: "WEB",
            clientVersion: "2.20210721.00.00",
            clientFormFactor: "UNKNOWN_FORM_FACTOR",
            clientScreen: "WATCH",
            mainAppWebInfo: {
               graftUrl:  `/watch?v=${videoId}`
            }
         },
         user: {
            lockedSafetyMode: false
         },
         request: {
            useSsl: true,
            internalExperimentFlags: [

            ],
            consistencyTokenJars: [

            ]
         }
      },
      videoId:  videoId,
      playbackContext: {
         contentPlaybackContext: {
            vis: 0,
            splay: false,
            autoCaptionsDefaultOn: false,
            autonavState: "STATE_NONE",
            html5Preference: "HTML5_PREF_WANTS",
            lactMilliseconds: "-1"
         }
      },
      racyCheckOk: false,
      contentCheckOk: false
    }
  }

  private parseFormats(info: any): Array<YoutubeVideo> {
    var formats = [];

    if (info.streamingData.formats) {
      formats = formats.concat(info.streamingData.formats);
    }
    if (info.streamingData.adaptiveFormats) {
      formats = formats.concat(info.streamingData.adaptiveFormats);
    }

    var ytVideos = [];

    formats.forEach((format) => {
      var newFormat = this.parseUrlFromStream(format);
      ytVideos.push(new YoutubeVideo(newFormat));
    });

    return ytVideos;
  }

  private parseUrlFromStream(stream) {
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









