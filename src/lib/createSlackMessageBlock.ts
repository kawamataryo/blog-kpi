import { Kpi } from "../types/types";
import { Item } from "../types/qiita-types";
import { ZennArticle } from "../types/zenn-types";

export const createSlackMessageBlock = (
  kpi: Kpi,
  previousWeekKpi: Kpi,
  recentQiitaPosts: Item[],
  recentZennArticles: ZennArticle[]
) => {
  const recentQiitaPostsText = recentQiitaPosts
    .map((item) => {
      return `${item.title} (*${item.likes_count}* LGTM)\n${item.url}`;
    })
    .join("\n\n");
  const recentZennArticlesText = recentZennArticles
    .map((article) => {
      return `${article.title} (*${article.liked_count}* LIKE)\n${article.url}`;
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
          {
            type: "mrkdwn",
            text: `*Zenn フォロワー数:*\n${kpi.zennFollowerCount}（+${
              kpi.zennFollowerCount - previousWeekKpi.zennFollowerCount
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
};
