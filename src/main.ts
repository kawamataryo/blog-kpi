import { Item, User } from "./types/qiita-types";

function myFunction() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getActiveSheet();
  const lastRow = sheet.getLastRow();

  const qiitaKpi = new QiitaClient().fetchKpi();

  sheet.getRange(lastRow + 1, 1).setValue(qiitaKpi.lgtmCount);
  sheet.getRange(lastRow + 1, 2).setValue(qiitaKpi.followersCount);
}

type QiitaKpi = {
  lgtmCount: number;
  followersCount: number;
};

class QiitaClient {
  private readonly QIITA_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
    "qiitaAccessToken"
  );
  private readonly QIITA_USER_NAME = PropertiesService.getScriptProperties().getProperty(
    "qiitaUserName"
  );
  private readonly QIITA_BASE_URL = "https://qiita.com/api/v2";
  private readonly PER_PAGE = 100;
  private readonly FETCH_OPTION = {
    headers: {
      Authorization: `Bearer ${this.QIITA_ACCESS_TOKEN}`,
    },
    method: "get" as const,
  };

  fetchKpi() {
    // ユーザー情報の取得
    const usersRes = UrlFetchApp.fetch(
      `${this.QIITA_BASE_URL}/users/${this.QIITA_USER_NAME}`,
      this.FETCH_OPTION
    );
    const user = JSON.parse(usersRes.getContentText()) as User;

    // 最大ページ数
    const maxPage = Math.ceil(user.items_count / this.PER_PAGE);

    // 投稿一覧の取得
    let allItems = [] as Item[];
    [...Array(maxPage)].forEach((_, i) => {
      const page = i + 1;
      const itemsRes = UrlFetchApp.fetch(
        `${this.QIITA_BASE_URL}/authenticated_user/items?page=${page}&per_page=${this.PER_PAGE}`,
        this.FETCH_OPTION
      );
      const items = JSON.parse(itemsRes.getContentText()) as Item[];
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
}
