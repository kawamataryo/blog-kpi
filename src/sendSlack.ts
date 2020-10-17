import { Kpi } from "./types/types";
import { Item } from "./types/qiita-types";
import { QiitaClient } from "./lib/qiitaClient";
import { ZennClient } from "./lib/zennClient";
import { ZennArticle } from "./types/zenn-types";
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
      createBlock(kpi, previousWeekKpi, recentQiitaPosts, recentZennArticles)
    ),
  };
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}

function createBlock(
  kpi: Kpi,
  previousWeekKpi: Kpi,
  recentQiitaPosts: Item[],
  recentZennArticles: ZennArticle[]
) {
  const recentQiitaPostsText = recentQiitaPosts
    .map((item) => {
      return `${item.title} (*${item.likes_count}* LGTM)\n${item.url}`;
    })
    .join("\n\n");
  const recentZennArticlesText = recentZennArticles
    .map((article) => {
      return `${article.title} (*${article.liked_count}* LIKE)\nhttps://zenn.dev/${ZENN_USER_NAME}/${article.slug}`;
    })
    .join("\n\n");

  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\n📊 今週のKPI (${Utilities.formatDate(
            new Date(kpi.date),
            "Asia/Tokyo",
            "yyyy/M/d"
          )}時点)`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Qiita記事数:*\n${kpi.qiitaPostCount}（+${
              kpi.qiitaPostCount - previousWeekKpi.qiitaPostCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*Qiita LGTM数:*\n${kpi.qiitaLgtmCount}（+${
              kpi.qiitaLgtmCount - previousWeekKpi.qiitaLgtmCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*Qiitaフォロワー数:*\n${kpi.qiitaFollowerCount}（+${
              kpi.qiitaFollowerCount - previousWeekKpi.qiitaFollowerCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*はてなブックマーク数:*\n${kpi.hatenaBookmarkCount}（+${
              kpi.hatenaBookmarkCount - previousWeekKpi.hatenaBookmarkCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*Twitterフォロワー数:*\n${kpi.twitterFollowerCount}（+${
              kpi.twitterFollowerCount - previousWeekKpi.twitterFollowerCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*Zenn 記事数:*\n${kpi.zennPostCount}（+${
              kpi.zennPostCount - previousWeekKpi.zennPostCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*Zenn LIKE数:*\n${kpi.zennLikeCount}（+${
              kpi.zennLikeCount - previousWeekKpi.zennLikeCount
            })`,
          },
        ],
        accessory: {
          type: "image",
          image_url: "https://image.flaticon.com/icons/png/512/138/138351.png",
          alt_text: "user thumbnail",
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "<https://www.notion.so/ryokawamata/My-KPI-72f35e0601f642ddadd556bb91d85a32|その他指標・チャート（Notion）>",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\n📝 今週の投稿記事`,
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: recentQiitaPostsText + recentZennArticlesText || "なし",
        },
      },
      {
        type: "divider",
      },
    ],
  };
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
