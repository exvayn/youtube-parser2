export class YoutubeVideo {
  // VARIABLES:
  //   url;
  //   quality;
  //   isAudioOnly;
  //   isVideoOnly;
  //   qualityLabel;
  //   audioQuality;
  //   rawData;

  constructor(rawData) {
    this.rawData = rawData;
    this.url = rawData.url;
    this.quality = rawData.quality;
    this.isAudioOnly = this._isStreamAudioOnly();
    this.isVideoOnly = this._isStreamVideoOnly();

    if (!this.isAudioOnly) {
      this.qualityLabel = rawData.qualityLabel;
    }

    if (!this.isVideoOnly) {
      this.audioQuality = rawData.audioQuality;
    }

    return this;
  }

  _isStreamAudioOnly() {
    return this.rawData.mimeType.includes("audio");
  };

  _isStreamVideoOnly() {
    return !(undefined !== this.rawData.audioQuality);
  };
}

export class YoutubeVideoData {
  // VARIABLES:
  //   videos;

  constructor(playerResponse, videos) {
    this.metadata = playerResponse.videoDetails;
    this.isPlayable = playerResponse.playabilityStatus.status === 'OK';
    this.playabilityStatus = playerResponse.playabilityStatus;
    this.videos = this.sortedList(videos);
  }

  getAudioOnlyList() {
    const ytList = this.videos.filter((video)=> {
      return video.isAudioOnly;
    })
    return this.sortedList(ytList);
  }

  getVideoWithAudioList() {
    const ytList = this.videos.filter((video)=> {
      return !video.isAudioOnly && !video.isVideoOnly;
    })
    return this.sortedList(ytList);
  }

  getVideoOnlyList() {
    const ytList = this.videos.filter((video)=> {
      return video.isVideoOnly;
    })
    return this.sortedList(ytList);
  }

  sortedList(list) {
    return list.sort((audio1, audio2)=>{
      return audio1.rawData.contentLength - audio2.rawData.contentLength;
    });
  }
}








