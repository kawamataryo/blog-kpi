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
        type: "section",
        text: {
          type: "mrkdwn",
          text: `\n📝 KawamataRyoの今週のKPI (${Utilities.formatDate(
            new Date(kpis.date),
            "Asia/Tokyo",
            "yyyy/M/d"
          )})`,
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
            text: `*Qiita記事数:*\n${kpis.qiitaPostCount}`,
          },
          {
            type: "mrkdwn",
            text: `*QiitaLGTM数:*\n${kpis.qiitaLgtmCount}`,
          },
          {
            type: "mrkdwn",
            text: `*Qiitaフォロワー数:*\n${kpis.qiitaFollowerCount}`,
          },
          {
            type: "mrkdwn",
            text: `*はてなブックマーク数:*\n${kpis.hatenaBookmarkCount}`,
          },
          {
            type: "mrkdwn",
            text: `*Twitterフォロワー数:*\n${kpis.twitterFollowerCount}`,
          },
        ],
        accessory: {
          type: "image",
          image_url: "https://image.flaticon.com/icons/png/512/138/138351.png",
          alt_text: "user thumbnail",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "その他チャート: https://www.notion.so/ryokawamata/My-KPI-72f35e0601f642ddadd556bb91d85a32",
        },
      },
    ],
  };
}
