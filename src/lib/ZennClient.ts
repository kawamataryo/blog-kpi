import { ZennKpi } from "../types/types";
import { ZennArticle } from "../types/zenn-types";

declare const Moment: {
  moment(arg?: any): any;
};

export class ZennClient {
  private readonly BASE_URL = "https://api.zenn.dev";
  private readonly FETCH_OPTION = {
    method: "get" as const,
  };
  private allArticle: ZennArticle[] = [];

  constructor(private userName: string) {
    this.allArticle = this.fetchMyAllArticles();
    console.log(this.allArticle);
  }

  fetchKpi(): ZennKpi {
    return {
      zennPostCount: this.postCount(),
      zennLikeCount: this.likeCount(),
    };
  }

  fetchWeeklyPosts(): ZennArticle[] {
    return this.allArticle.filter((article) => {
      return Moment.moment(article.published_at).isAfter(
        Moment.moment().add(-7, "days")
      );
    });
  }

  private fetchMyAllArticles(): ZennArticle[] {
    const response = UrlFetchApp.fetch(
      `https://api.zenn.dev/users/ryo_kawamata/articles`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()).articles as ZennArticle[];
  }

  private postCount(): number {
    return this.allArticle.length;
  }

  private likeCount(): number {
    return this.allArticle.reduce<number>((likeCount, article) => {
      return (likeCount += article.liked_count);
    }, 0);
  }
}

function test() {
  const response = UrlFetchApp.fetch(
    `https://api.zenn.dev/users/ryo_kawamata/articles`,
    {
      method: "get",
    }
  );
  console.log(JSON.parse(response.getContentText()).articles as ZennArticle[]);
}
