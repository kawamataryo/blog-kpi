import { Item, User } from "./types/qiita-types";
import { QiitaKpi, HatenaKpi } from "./types/types";
const BLOG_URL = PropertiesService.getScriptProperties().getProperty(
  "blogUrl"
) as string;
const QIITA_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
  "qiitaAccessToken"
) as string;
const QIITA_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "qiitaUserName"
) as string;

function myFunction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const lastRow = sheet.getLastRow();

  const qiitaKpi = new QiitaClient(
    QIITA_ACCESS_TOKEN,
    QIITA_USER_NAME
  ).fetchKpi();

  const hatenaKpi = new HatenaClient(BLOG_URL).fetchKpi();

  sheet.getRange(lastRow + 1, 1).setValue(qiitaKpi.lgtmCount);
  sheet.getRange(lastRow + 1, 2).setValue(qiitaKpi.followersCount);
  sheet.getRange(lastRow + 1, 3).setValue(hatenaKpi.bookmarkCount);
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
    // ユーザー情報の取得
    const user = this.fetchUser();
    // 最大ページ数
    const maxPage = Math.ceil(user.items_count / this.PER_PAGE);
    // 投稿一覧の取得
    let allItems = [] as Item[];
    [...Array(maxPage)].forEach((_, i) => {
      const page = i + 1;
      const items = this.fetchItems(page, this.PER_PAGE);
      allItems = [...allItems, ...items];
    });
    // LGTMの集計
    const lgtmCount = allItems.reduce(
      (result, item) => result + item.likes_count,
      0
    );
    return {
      lgtmCount,
      followersCount: user.followers_count,
    };
  }

  private fetchUser() {
    const usersRes = UrlFetchApp.fetch(
      `${this.BASE_URL}/users/${this.userName}`,
      this.FETCH_OPTION
    );
    return JSON.parse(usersRes.getContentText()) as User;
  }

  private fetchItems(page: number, perPage: number) {
    const itemsRes = UrlFetchApp.fetch(
      `${this.BASE_URL}/authenticated_user/items?page=${page}&per_page=${perPage}`,
      this.FETCH_OPTION
    );
    return JSON.parse(itemsRes.getContentText()) as Item[];
  }
}

class HatenaClient {
  private readonly BASE_URL = "http://b.hatena.ne.jp";

  constructor(private blogUrl: string) {}

  fetchKpi(): HatenaKpi {
    // TODO: 他に良いAPI見つかれば差し替える
    const redirectUrl = this.getRedirectUrl(
      `${this.BASE_URL}/bc/${this.blogUrl}`
    );

    const countFilenname = redirectUrl.match(
      /https:\/\/b.st-hatena\.com\/images\/counter\/default\/\d+\/\d+\/(\d+).gif/
    )![1];

    return {
      bookmarkCount: Number(countFilenname),
    };
  }

  getRedirectUrl(url: string): string {
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
