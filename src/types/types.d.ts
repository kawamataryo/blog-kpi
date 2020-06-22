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

export type Kpis = {
  date: string;
  qiitaPostCount: string;
  qiitaLgtmCount: string;
  qiitaFollowerCount: string;
  hatenaBookmarkCount: string;
  twitterFollowerCount: string;
};
