import fetch  from "node-fetch";

export class YoutubeSignatureParser {
  videoId: string;
  private loader: Promise<unknown>;
  private decriptAlgorithm: any;

  constructor(videoId = "pPw_izFr5PA") {
    this.videoId = videoId;
    this.loader = this.loadDecriptionAlgorithm();
  }

  onLoad(callback) {
    this.loader.then(() => {
      callback();
    });
  }

  onError(callback) {
    this.loader.catch((e) => {
      callback(e);
    });;
  }

  getSignature(sig) {
    if (this.decriptAlgorithm === undefined) return;

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
    eval(this.decriptAlgorithm);

    return a.join("");
  };

  private async loadDecriptionAlgorithm() {
    const decriptAlgorithm = await this.getSignatureDecriptAlgorithm();
    this.decriptAlgorithm = decriptAlgorithm;
    return decriptAlgorithm;
  }

  private getSignatureDecriptAlgorithm() {
    return new Promise((fulfill, reject) => {
      this.getPlayerIasPath().then((playerIasPath) => {
        return fetch('https://www.youtube.com' + playerIasPath, { headers: { "User-Agent": "Mozilla/5.0" } })
          .then((response) => response.text())
          .then((response) => {
            const decriptAlgorithm = this.getChiper(response);
            fulfill(decriptAlgorithm);
          }).catch((e) => {
            reject(e);
          });
      })
    });
  };

  private getPlayerIasPath() {
    return fetch('https://www.youtube.com/embed/' + this.videoId, { headers: { "User-Agent": "Mozilla/5.0" } })
      .then((response) => response.text())
      .then((response) => {
        var subStringWithPath = response.match(/src=\"([^ ]*)\/base.js\"/)[1];
        var playerIasPath = subStringWithPath + "/base.js";
        return playerIasPath;
      });
  };

  private getChiper(decipherScript) {
    var decriptAlgorithm = "";
    var decipherPatterns: any = decipherScript.split(".split(\"\")");
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
