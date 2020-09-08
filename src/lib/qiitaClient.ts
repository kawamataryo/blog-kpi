import { QiitaKpi } from "../types/types";
import { Item, User } from "../types/qiita-types";

declare const Moment: {
  moment(arg?: any): any;
};

export class QiitaClient {
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

  fetchWeeklyPosts(): Item[] {
    const items = this.fetchItems(1, this.PER_PAGE);
    return items.filter((item) => {
      return Moment.moment(item.created_at).isAfter(
        Moment.moment().add(-7, "days")
      );
    });
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
