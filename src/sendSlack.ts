import { Kpi } from "./types/types";
import { QiitaClient } from "./lib/qiitaClient";
import { ZennClient } from "./lib/zennClient";
import { createSlackMessageBlock } from "./lib/createSlackMessageBlock";

const WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty(
  "webhookUrl"
) as string;
const QIITA_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
  "qiitaAccessToken"
) as string;
const QIITA_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "qiitaUserName"
) as string;
const ZENN_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "zennUserName"
) as string;

const KPI_KEYS = [
  "date",
  "qiitaPostCount",
  "qiitaLgtmCount",
  "qiitaStockCount",
  "qiitaFollowerCount",
  "hatenaBookmarkCount",
  "twitterFollowerCount",
  "dailyPageView",
  "dailyUsers",
  "weeklyPageView",
  "weeklyUsers",
  "targetValueQiitaLgtmCount",
  "targetValueQiitaFollowersCount",
  "targetValueTwitterFollowersCount",
  "targetValueHatenaBookmarkCount",
  "targetValueDailyPageView",
  "zennPostCount",
  "zennLikeCount",
  "zennFollowerCount",
];

function postMessage() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const kpi = getKpi(sheet.getLastRow(), sheet);
  const previousWeekKpi = getKpi(sheet.getLastRow() - 7, sheet);
  const recentQiitaPosts = new QiitaClient(
    QIITA_ACCESS_TOKEN,
    QIITA_USER_NAME
  ).fetchWeeklyPosts();
  const recentZennArticles = new ZennClient(ZENN_USER_NAME).fetchWeeklyPosts();

  const options = {
    method: "post" as const,
    headers: { "Content-type": "application/json" },
    payload: JSON.stringify(
      createSlackMessageBlock(
        kpi,
        previousWeekKpi,
        recentQiitaPosts,
        recentZennArticles
      )
    ),
  };
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}

function getKpi(
  rowPosition: number,
  sheet: GoogleAppsScript.Spreadsheet.Sheet
): Kpi {
  return KPI_KEYS.reduce<any>((result, key, i) => {
    const cellValue = sheet.getRange(rowPosition, i + 1).getValue();
    if (key === "date") {
      result[key] = cellValue;
    } else {
      result[key] = Number(cellValue);
    }
    return result;
  }, {}) as Kpi;
}
