import { ZennKpi } from "../types/types";
import { ZennArticle, Follower } from "../types/zennTypes";

declare const Moment: {
  moment(arg?: any): any;
};

export class ZennClient {
  private readonly BASE_URL = "https://zenn.dev";
  private readonly BASE_API_URL = "https://api.zenn.dev";
  private readonly FETCH_OPTION = {
    method: "get" as const,
  };
  private allArticle: ZennArticle[] = [];
  private followers: Follower[] = [];

  constructor(private userName: string) {
    this.allArticle = this.fetchMyAllArticles();
    this.followers = this.fetchMyFollowers();
  }

  fetchKpi(): ZennKpi {
    return {
      zennPostCount: this.postCount(),
      zennLikeCount: this.likeCount(),
      zennFollowerCount: this.followerCount(),
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
      `${this.BASE_API_URL}/users/${this.userName}/articles`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()).articles.map(
      (article: any) => {
        // レスポンスに記事のurlがないので、ここで組み立てる
        return {
          ...article,
          url: `${this.BASE_URL}/${this.userName}/articles/${article.slug}`,
        };
      }
    ) as ZennArticle[];
  }

  private fetchMyFollowers(): Follower[] {
    const response = UrlFetchApp.fetch(
      `${this.BASE_API_URL}/users/${this.userName}/followers`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()).users as Follower[];
  }

  private postCount(): number {
    return this.allArticle.length;
  }

  private likeCount(): number {
    return this.allArticle.reduce<number>((likeCount, article) => {
      return (likeCount += article.liked_count);
    }, 0);
  }

  private followerCount(): number {
    return this.followers.length;
  }
}
