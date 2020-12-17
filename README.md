# Youtube Video Parser
A util to extract raw video-URLs and format information from a YouTube-video page.


## Install

```
$ npm install -g youtube-parser2
```

## Usage
```
Promise getVideoData(string url)
```

params:
* url - YouTube video page.

```js
const ytParser = require('youtube-parser2');

ytParser.getVideoData("https://www.youtube.com/watch?v=8uQqaauS5UA")
  .then(function (youtubeVideoData) {
    console.log(youtubeVideoData);
  })
  .catch(function (error) {
    console.log(error);
  })
```

return value - A promise object to resolve with `YoutubeVideoData` object.

## `YoutubeVideoData` Object

### Fields
* metadata - youtube video information
* isPlayable - is video availeable to play
* playabilityStatus - video playability status
* isPlayable - is video availeable to play
* playabilityStatus - video playability status
* videos - list of all `YoutubeVideo` objects. Sorted by `rawData.contentLength` field in ascending order.

`YoutubeVideoData` example:
```js
YoutubeVideoData {
  metadata: {
    videoId: 'videoId',
    title: 'Video Title',
    lengthSeconds: '123',
    keywords: [Array],
    channelId: 'channelId',
    isOwnerViewing: false,
    shortDescription: "...",
    isCrawlable: true,
    thumbnail: [Object],
    averageRating: 4.22,
    allowRatings: true,
    viewCount: '123123123',
    author: 'YT User',
    isPrivate: false,
    isUnpluggedCorpus: false,
    isLiveContent: false
  },
  isPlayable: false,
  playabilityStatus: {
    status: 'UNPLAYABLE',
    reason: 'Video unavailable'
  },
  videos: [YoutubeVideo]
}
```

### Methods
* getAudioOnlyList() - list of `YoutubeVideo` objects that consists of only a audio track
* getVideoWithAudioList() - list of `YoutubeVideo` objects that consists of track with video and audio
* getVideoOnlyList() - list of `YoutubeVideo` objects that consists of only a video track

All `YoutubeVideo` lists sorted by `rawData.contentLength` field in ascending order. So, if you want to get the lowest quality, just take the first item in the list. For the highest quality, take the last one.

## `YoutubeVideo` Object

### Fields
* rawData - raw video information
* url - direct link to the video file
* quality - video quality
* isAudioOnly - file consists only a audio track
* isVideoOnly - file consists only a video track
* qualityLabel - video quality label

`YoutubeVideo` example:
```js
YoutubeVideo {
  rawData: [Object],
  url: 'https://.....',
  quality: 'medium',
  isAudioOnly: false,
  isVideoOnly: true,
  qualityLabel: '360p'
}
```
