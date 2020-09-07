import { Kpi } from "./types/types";
import { Item } from "./types/qiita-types";
const WEBHOOK_URL = PropertiesService.getScriptProperties().getProperty(
  "webhookUrl"
) as string;
const QIITA_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty(
  "qiitaAccessToken"
) as string;

declare const Moment: {
  moment(arg?: any): any;
};

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
  const kpi = getKpi(sheet.getLastRow(), sheet);
  const previousWeekKpi = getKpi(sheet.getLastRow() - 7, sheet);
  const recentPosts = new QiitaClient(QIITA_ACCESS_TOKEN).fetchWeeklyPosts();

  const options = {
    method: "post" as const,
    headers: { "Content-type": "application/json" },
    payload: JSON.stringify(createBlock(kpi, previousWeekKpi, recentPosts)),
  };
  UrlFetchApp.fetch(WEBHOOK_URL, options);
}

function createBlock(kpi: Kpi, previousWeekKpi: Kpi, recentPosts: Item[]) {
  const recentPostsText = recentPosts
    .map((item) => {
      return `${item.title} (*${item.likes_count}* LGTM)\n${item.url}`;
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
            text: `*QiitaLGTM数:*\n${kpi.qiitaLgtmCount}（+${
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
          text: recentPostsText,
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

class QiitaClient {
  private readonly BASE_URL = "https://qiita.com/api/v2";
  private readonly PER_PAGE = 20;
  private readonly FETCH_OPTION = {
    headers: {
      Authorization: `Bearer ${this.accessToken}`,
    },
    method: "get" as const,
  };

  constructor(private accessToken: string) {}

  fetchWeeklyPosts(): Item[] {
    const items = this.fetchItems(1, this.PER_PAGE);
    return items.filter((item) => {
      return Moment.moment(item.created_at).isAfter(
        Moment.moment().add(-7, "days")
      );
    });
  }

  private fetchItems(page: number, perPage: number) {
    const response = UrlFetchApp.fetch(
      `${this.BASE_URL}/authenticated_user/items?page=${page}&per_page=${perPage}`,
      this.FETCH_OPTION
    );
    return JSON.parse(response.getContentText()) as Item[];
  }
}
