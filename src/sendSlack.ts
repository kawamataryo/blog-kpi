import { Kpis } from "./types/types";

const WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty(
  "webhookUrl"
) as string;

const KPI_KEYS = [
  "date",
  "qiitaPostCount",
  "qiitaLgtmCount",
  "qiitaStockCount",
  "qiitaFollowerCount",
  "hatenaBookmarkCount",
  "twitterFollowerCount",
];

function postMessage() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const kpis = KPI_KEYS.reduce<any>((result, key, i) => {
    result[key] = sheet.getRange(sheet.getLastRow(), i + 1).getValue();
    return result;
  }, {});

  const options = {
    method: "post" as const,
    headers: { "Content-type": "application/json" },
    payload: JSON.stringify(createBlock(kpis)),
  };
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}

function createBlock(kpis: Kpis) {
  return {
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "*RyoKawamataの今週のKPI*",
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `
          ${Utilities.formatDate(
            new Date(kpis.date),
            "Asia/Tokyo",
            "yyyy年M月d日"
          )})*
Qiita記事数: *${kpis.qiitaPostCount}*
QiitaLGTM数: *${kpis.qiitaLgtmCount}*
Qiitaフォロワー数: *${kpis.qiitaFollowerCount}*
はてなブックマーク数: *${kpis.hatenaBookmarkCount}*
Twitterフォロワー数: *${kpis.twitterFollowerCount}*
          `,
        },
        accessory: {
          type: "image",
          image_url: "https://image.flaticon.com/icons/png/512/138/138351.png",
          alt_text: "user thumbnail",
        },
      },
      {
        type: "divider",
      },
    ],
  };
}
