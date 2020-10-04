export type QiitaKpi = {
  postCount: number;
  lgtmCount: number;
  stockCount: number;
  followersCount: number;
};

export type HatenaKpi = {
  bookmarkCount: number;
};

export type TwitterKpi = {
  followersCount: number;
};

export type ZennKpi = {
  zennLikeCount: number;
  zennPostCount: number;
}

export type Kpi = {
  date: string;
  qiitaPostCount: number;
  qiitaLgtmCount: number;
  qiitaStockCount: number;
  qiitaFollowerCount: number;
  hatenaBookmarkCount: number;
  twitterFollowerCount: number;
  dailyPageView: number;
  dailyUsers: number;
  weeklyPageView: number;
  weeklyUsers: number;
  zennPostCount: number;
  zennLikeCount: number;
};
