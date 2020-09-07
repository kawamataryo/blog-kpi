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

export type Kpi = {
  date: string;
  qiitaPostCount: number;
  qiitaLgtmCount: number;
  qiitaStockCount: number;
  qiitaFollowerCount: number;
  hatenaBookmarkCount: number;
  twitterFollowerCount: number;
};
