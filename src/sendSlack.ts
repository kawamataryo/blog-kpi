import { Kpis } from "./types/types";

const WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty(
  "webhookUrl"
) as string;

const KPI_KEYS = [
  "date",
  "qiitaPostCount",
  "qiitaLgtmCount",
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
  console.log(kpis)
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
          text: `
          *Blog KPI(${kpis.date})*
          Qiita記事数: *${kpis.qiitaPostCount}*
          QiitaLGTM数: *${kpis.qiitaLgtmCount}*
          Qiitaフォロワー数: *${kpis.qiitaFollowerCount}*
          はてなブックマーク数: *${kpis.hatenaBookmarkCount}*
          Twitterフォロワー数: *${kpis.twitterFollowerCount}*
          `,
        },
      },
    ],
  };
}
