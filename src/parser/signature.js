import fetch  from "node-fetch";

export class YoutubeSignatureParser {
  // VARIABLES:
  //   videoId;
  //   _decriptAlgorithm;
  //   _loader;

  constructor(videoId) {
    if (videoId) {
      this.videoId = videoId;
    } else {
      this.videoId = "pPw_izFr5PA" // any video - GOOBA
    }
    this._loader = this._loadDecriptionAlgorithm();
  }

  onLoad(callback) {
    var self = this;
    this._loader.then(() => {
      callback();
    });
  }

  onError(callback) {
    this._loader.catch((e) => {
      callback(e);
    });;
  }

  getSignature(sig) {
    if (this._decriptAlgorithm === undefined) return;

    var reverse = (a) => {
      return a.reverse();
    };

    var splice = (a, b) => {
      return a.slice(b);
    };

    var length = (a, b) => {
      var c = a[0];
      a[0] = a[b % a.length];
      a[b] = c;
      return a;
    };

    var lengtha = (a, b) => {
      var c = a[0];
      a[0] = a[b % a.length];
      a[b % a.length] = c;
      return a;
    };

    var a = sig.split("");

    // manipulations with "a"
    eval(this._decriptAlgorithm);

    return a.join("");
  };

  _loadDecriptionAlgorithm() {
    return this._getSignatureDecriptAlgorithm().then((decriptAlgorithm) => {
      this._decriptAlgorithm = decriptAlgorithm;
      return decriptAlgorithm;
    })
  }

  _getSignatureDecriptAlgorithm() {
    return new Promise((fulfill, reject) => {
      this._getPlayerIasPath().then((playerIasPath) => {
        return fetch('https://www.youtube.com' + playerIasPath, { headers: { "User-Agent": "Mozilla/5.0" } })
          .then((response) => response.text())
          .then((response) => {
            const decriptAlgorithm = this._getChiper(response);
            fulfill(decriptAlgorithm);
          }).catch((e) => {
            reject(e);
          });
      })
    });
  };

  _getPlayerIasPath() {
    return fetch('https://www.youtube.com/embed/' + this.videoId, { headers: { "User-Agent": "Mozilla/5.0" } })
      .then((response) => response.text())
      .then((response) => {
        var subStringWithPath = response.split("name=\"player_ias/base\"")[0];
        var startPath = subStringWithPath.lastIndexOf("src=\"") + 5;
        var endPath = subStringWithPath.lastIndexOf("\"");
        var playerIasPath = subStringWithPath.substr(startPath, endPath - startPath);
        return playerIasPath;
      });
  };

  _getChiper(decipherScript) {
    var decriptAlgorithm = "";
    var decipherPatterns = decipherScript.split(".split(\"\")");
    decipherPatterns.splice(0, 1);

    for (var key of Object.keys(decipherPatterns)) {
      var value = decipherPatterns[key];
      value = value.split("}")[0].split(".join(\"\")");

      if (value.length === 2) {
        value = value[0].split(";");

        value.splice(value.length - 1, 1);
        value.splice(0, 1);
        decipherPatterns = value.join(";");
        break;
      }
    }

    var deciphers = decipherPatterns.match(/[^\;](?=\;).*?(?=\[|\.)/g);

    if (deciphers && deciphers.length >= 2) {
      //Convert deciphers to object
      //Convert pattern to array
      deciphers = deciphers[0].substr(2, deciphers[0].length - 2);
      var deciphersObjectVar = decipherPatterns;
      var decipher = decipherScript.split(deciphers + "={")[1];
      decipher = decipher.replace(/[\r\n]/g, "");
      decipher = decipher.split("}};")[0];
      decipher = decipher.split("},");
      deciphers = Array();

      for (var key of Object.keys(decipher)) {
        var func = decipher[key];
        deciphers[func.split(":function")[0]] = func.split("){")[1];
      }

      decipherPatterns = decipherPatterns.split(deciphersObjectVar + ".").join("");
      decipherPatterns = decipherPatterns.split(deciphersObjectVar + "[").join("");
      decipherPatterns = decipherPatterns.replace(/\]\(\a\,/g, "->(");
      decipherPatterns = decipherPatterns.replace(/\(\a\,/g, "->(");
      decipherPatterns = decipherPatterns.split(";");
      var patterns = decipherPatterns;

      deciphers = deciphers;

      for (var i = 0; i < patterns.length; i++) {
        var executes = patterns[i].split("->");
        var execute = executes[0].split(".");
        var number_str = executes[1].replace("(", "");
        number_str = number_str.replace(")", "");
        var number = Math.round(number_str);
        execute = deciphers[execute[1]];

        var processSignature = "";
        switch (execute) {
          case "a.reverse()":
            processSignature = "reverse";
            break;

          case "var c=a[0];a[0]=a[b%a.length];a[b]=c":
            processSignature = "length";
            break;

          case "var c=a[0];a[0]=a[b%a.length];a[b%a.length]=c":
            processSignature = "lengtha";
            break;

          case "a.splice(0,b)":
            processSignature = "splice";
            break;
        }

        decriptAlgorithm += "a = " + processSignature + "(a," + number + ");";
      }
    }

    return decriptAlgorithm;
  };
}
