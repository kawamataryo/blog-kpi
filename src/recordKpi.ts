import { QiitaClient } from "./lib/qiitaClient";
import { HatenaClient } from "./lib/hatenaClient";
import { GoogleAnalyticsClient } from "./lib/googleAnalyticsClient";
import { TwitterClient } from "./lib/twitterClient";
import { ZennClient } from "./lib/zennClient";

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
const GA_ID = PropertiesService.getScriptProperties().getProperty(
  "gaId"
) as string;
const ZENN_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "zennUserName"
) as string;

// 目標値
const TARGET_VALUES = {
  qiitaLgtmCount: 8500,
  qiitaFollowersCount: 320,
  twitterFollowersCount: 1200,
  hatenaBookmarkCount: 2000,
  dailyPageView: 1450,
};

// -------------------------------------------------------------
// Blog KPIのスプレッドシートへの記録
// -------------------------------------------------------------
function recordKpi() {
  const today = Utilities.formatDate(new Date(), "JST", "yyyy/MM/dd");
  const qiitaKpi = new QiitaClient(
    QIITA_ACCESS_TOKEN,
    QIITA_USER_NAME
  ).fetchKpi();
  const hatenaKpiAboutQiita = new HatenaClient(BLOG_URL).fetchKpi();
  const hatenaKpiAboutZenn = new HatenaClient(`https://zenn.dev/${ZENN_USER_NAME}`).fetchKpi();
  const gaKpi = new GoogleAnalyticsClient(GA_ID).fetchKpi();
  const twitterKpi = new TwitterClient(TWITTER_ID).fetchKpi();
  const zennKpi = new ZennClient(ZENN_USER_NAME).fetchKpi();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const insertLow = sheet.getLastRow() + 1;
  [
    today,
    qiitaKpi.postCount,
    qiitaKpi.lgtmCount,
    qiitaKpi.stockCount,
    qiitaKpi.followersCount,
    hatenaKpiAboutQiita.bookmarkCount + hatenaKpiAboutZenn.bookmarkCount,
    twitterKpi.followersCount,
    gaKpi.dailyPageView,
    gaKpi.dailyUsers,
    gaKpi.weeklyPageView,
    gaKpi.weeklyUsers,
    TARGET_VALUES.qiitaLgtmCount,
    TARGET_VALUES.qiitaFollowersCount,
    TARGET_VALUES.twitterFollowersCount,
    TARGET_VALUES.hatenaBookmarkCount,
    TARGET_VALUES.dailyPageView,
    zennKpi.zennPostCount,
    zennKpi.zennLikeCount,
  ].forEach((data, i) => {
    sheet.getRange(insertLow, i + 1).setValue(data);
  });
}
