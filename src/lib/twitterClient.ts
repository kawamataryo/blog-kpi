import { TwitterKpi } from "../types/types";

export class TwitterClient {
  private readonly BASE_URL = "https://api.twitter.com/1.1";
  private twitterService: any;

  constructor(private twitterId: string) {
    this.twitterService = getTwitterService();
  }

  fetchKpi(): TwitterKpi {
    const user = this.fetchUser(this.twitterId);
    return {
      followersCount: user.followers_count,
    };
  }

  fetchUser(twitterId: string) {
    const userRes = this.twitterService.fetch(
      `${this.BASE_URL}/users/show.json?user_id=${twitterId}`,
      {
        method: "get",
        muteHttpExceptions: true,
      }
    );

    return JSON.parse(userRes.getContentText()) as {
      followers_count: number;
    };
  }
}

// -------------------------------------------------------------
// Twitter APIのOauth設定
// 参考 https://qiita.com/k7a/items/e6a456bec26b4e667c47
// -------------------------------------------------------------

// Twitter AppのConsumer Api Key
const CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty(
  "twitterConsumerKey"
) as string;
const CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty(
  "twitterConsumerSecret"
) as string;

// 認証URLを取得しログに出力する
function logAuthorizeUri() {
  const twitterService = getTwitterService();
  Logger.log(twitterService.authorize());
}

// OAuth認証をよしなにしてくれるサービスクラスのインスタンスを生成・取得する
function getTwitterService() {
  return (
    OAuth1.createService("Twitter")
      .setAccessTokenUrl("https://api.twitter.com/oauth/access_token")
      .setRequestTokenUrl("https://api.twitter.com/oauth/request_token")
      .setAuthorizationUrl("https://api.twitter.com/oauth/authenticate")
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)
      // リダイレクト時に実行されるコールバック関数を指定する
      .setCallbackFunction("authCallback")
      // アクセストークンを保存するPropertyStoreを指定する
      .setPropertyStore(PropertiesService.getUserProperties())
  );
}

// リダイレクト時に実行されるコールバック関数
function authCallback(request) {
  const twitterService = getTwitterService();
  // ここで認証成功時にアクセストークンがPropertyStoreに保存される
  const isAuthorized = twitterService.handleCallback(request);
  if (isAuthorized) {
    return HtmlService.createHtmlOutput("Success");
  } else {
    return HtmlService.createHtmlOutput("Denied");
  }
}
