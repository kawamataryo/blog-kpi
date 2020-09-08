import { HatenaKpi } from "../types/types";

export class HatenaClient {
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
