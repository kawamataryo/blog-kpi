import { Item, User } from "./types/qiita-types";
import { QiitaKpi, HatenaKpi, TwitterKpi } from "./types/types";

const BLOG_URL = PropertiesService.getScriptProperties().getProperty(
  "blogUrl"
) as string;
const QIITA_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
  "qiitaAccessToken"
) as string;
const QIITA_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "qiitaUserName"
) as string;
const TWITTER_ID = PropertiesService.getScriptProperties().getProperty(
  "twitterId"
) as string;

// -------------------------------------------------------------
// Blog KPIの記録
// -------------------------------------------------------------
function recordKpi() {
  const today = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd");
  const qiitaKpi = new QiitaClient(
    QIITA_ACCESS_TOKEN,
    QIITA_USER_NAME
  ).fetchKpi();
  const hatenaKpi = new HatenaClient(BLOG_URL).fetchKpi();
  const twitterKpi = new TwitterClient(TWITTER_ID).fetchKpi();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const insertLow = sheet.getLastRow() + 1;
  [
    today,
    qiitaKpi.postCount,
    qiitaKpi.lgtmCount,
    qiitaKpi.stockCount,
    qiitaKpi.followersCount,
    hatenaKpi.bookmarkCount,
    twitterKpi.followersCount,
  ].forEach((data, i) => {
    sheet.getRange(insertLow, i + 1).setValue(data);
  });
}

class QiitaClient {
  private readonly BASE_URL = "https://qiita.com/api/v2";
  private readonly PER_PAGE = 100;
  private readonly FETCH_OPTION = {
    headers: {
      Authorization: `Bearer ${this.accessToken}`,
    },
    method: "get" as const,
  };

  constructor(private accessToken: string, private userName: string) {}

  fetchKpi(): QiitaKpi {
    const user = this.fetchUser();
    const items = this.fetchAllItems(user);
    const lgtmCount = this.tallyUpLgtmCount(items);
    const stockCount = this.tallyUpStockCount(items);

    return {
      lgtmCount,
      stockCount,
      followersCount: user.followers_count,
      postCount: user.items_count,
    };
  }

  private fetchUser() {
    const response = UrlFetchApp.fetch(
      `${this.BASE_URL}/users/${this.userName}`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()) as User;
  }

  private fetchAllItems(user: User) {
    // 最大ページ数
    const maxPage = Math.ceil(user.items_count / this.PER_PAGE);
    // 投稿一覧の取得
    let allItems = [] as Item[];
    [...Array(maxPage)].forEach((_, i) => {
      const page = i + 1;
      const items = this.fetchItems(page, this.PER_PAGE);
      allItems = [...allItems, ...items];
    });
    return allItems;
  }

  private fetchItems(page: number, perPage: number) {
    const response = UrlFetchApp.fetch(
      `${this.BASE_URL}/authenticated_user/items?page=${page}&per_page=${perPage}`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()) as Item[];
  }

  private fetchStockers(itemId: string) {
    const response = UrlFetchApp.fetch(
      `${this.BASE_URL}/items/${itemId}/stockers`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()) as User[];
  }

  private tallyUpLgtmCount(items: Item[]) {
    const lgtmCount = items.reduce(
      (result, item) => result + item.likes_count,
      0
    );
    return lgtmCount;
  }

  private tallyUpStockCount(items: Item[]) {
    const stockCount = items.reduce((result, item) => {
      const stockedUser = this.fetchStockers(item.id);
      return result + stockedUser.length;
    }, 0);
    return stockCount;
  }
}

class HatenaClient {
  private readonly BASE_URL = "http://b.hatena.ne.jp";

  constructor(private blogUrl: string) {}

  fetchKpi(): HatenaKpi {
    const bookmarkCount = this.fetchBookmarkCount();

    return {
      bookmarkCount,
    };
  }

  private fetchBookmarkCount() {
    const redirectUrl = this.getRedirectUrl(
      `${this.BASE_URL}/bc/${this.blogUrl}`
    );
    // `https://b.st-hatena.com/images/counter/default/00/00/0000653.gif` の形式でブクマ数が書かれたgif画像のURLを取得できるので、
    // そこからブクマ数を抽出する
    const bookmarkCount = redirectUrl.match(
      /https:\/\/b.st-hatena\.com\/images\/counter\/default\/\d+\/\d+\/(\d+).gif/
    )![1];

    return Number(bookmarkCount);
  }

  private getRedirectUrl(url: string): string {
    const response = UrlFetchApp.fetch(url, {
      followRedirects: false,
      muteHttpExceptions: false,
    });
    const redirectUrl = (response.getHeaders() as any)["Location"] as string;
    if (redirectUrl) {
      const nextRedirectUrl = this.getRedirectUrl(redirectUrl);
      return nextRedirectUrl;
    } else {
      return url;
    }
  }
}

class TwitterClient {
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
