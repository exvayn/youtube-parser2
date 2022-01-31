export class YoutubeVideo {
  rawData: any;
  url: string;
  quality: string;
  isAudioOnly: boolean;
  isVideoOnly: boolean;
  qualityLabel: any;
  audioQuality: any;

  constructor(rawData) {
    this.rawData = rawData;
    this.url = rawData.url;
    this.quality = rawData.quality;
    this.isAudioOnly = this.isStreamAudioOnly();
    this.isVideoOnly = this.isStreamVideoOnly();

    if (!this.isAudioOnly) {
      this.qualityLabel = rawData.qualityLabel;
    }

    if (!this.isVideoOnly) {
      this.audioQuality = rawData.audioQuality;
    }

    return this;
  }

  private isStreamAudioOnly() {
    return this.rawData.mimeType.includes("audio");
  };

  private isStreamVideoOnly() {
    return !(undefined !== this.rawData.audioQuality);
  };
}

export class YoutubeVideoData {
  metadata: any;
  isPlayable: boolean;
  playabilityStatus: boolean;
  videos: Array<YoutubeVideo>;

  constructor(playerResponse, videos) {
    this.metadata = playerResponse.videoDetails;
    this.isPlayable = playerResponse.playabilityStatus.status === 'OK';
    this.playabilityStatus = playerResponse.playabilityStatus;
    this.videos = this.sortedList(videos);
  }

  getAudioOnlyList(): Array<YoutubeVideo> {
    const ytList = this.videos.filter((video)=> {
      return video.isAudioOnly;
    })
    return this.sortedList(ytList);
  }

  getVideoWithAudioList(): Array<YoutubeVideo> {
    const ytList = this.videos.filter((video)=> {
      return !video.isAudioOnly && !video.isVideoOnly;
    })
    return this.sortedList(ytList);
  }

  getVideoOnlyList(): Array<YoutubeVideo> {
    const ytList = this.videos.filter((video)=> {
      return video.isVideoOnly;
    })
    return this.sortedList(ytList);
  }

  private sortedList(list: Array<YoutubeVideo>): Array<YoutubeVideo> {
    return list.sort((audio1, audio2)=>{
      return audio1.rawData.contentLength - audio2.rawData.contentLength;
    });
  }
}








