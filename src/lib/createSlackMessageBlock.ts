import { Kpi } from "../types/types";
import { Item } from "../types/qiitaTypes";
import { ZennArticle } from "../types/zennTypes";
import { NoteContent } from "../types/noteTypes";

const QIITA_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "qiitaUserName"
) as string;
const ZENN_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "zennUserName"
) as string;
const NOTE_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "noteUserName"
) as string;
const TWITTER_USER_NAME = PropertiesService.getScriptProperties().getProperty(
  "twitterUserName"
) as string;

export function createSlackMessageBlock(
  kpi: Kpi,
  previousWeekKpi: Kpi,
  recentQiitaPosts: Item[],
  recentZennArticles: ZennArticle[],
  recentNoteContents: NoteContent[]
) {
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
  const recentNoteContentsText = recentNoteContents
    .map((content) => {
      return `${content.name} (*${content.likeCount}* LIKE)\n${content.url}`;
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
        text: {
          type: "mrkdwn",
          text: `https://qiita.com/${QIITA_USER_NAME}`,
        },
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
        ],
        accessory: {
          type: "image",
          image_url:
            "https://drive.google.com/uc?id=1bWoYzU4Jy0h3K_vpm84UcYPBGrxEVdgQ",
          alt_text: "qiita thumbnail",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `https://zenn.dev/${ZENN_USER_NAME}`,
        },
      },
      {
        type: "section",
        fields: [
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
          image_url:
            "https://drive.google.com/uc?id=11WFXbNo0pB5-HnlqFDsfg7c01xCoPTMo",
          alt_text: "zenn thumbnail",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `https://note.com/${NOTE_USER_NAME}`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*note 記事数:*\n${kpi.noteContentCount}（+${
              kpi.noteContentCount - previousWeekKpi.noteContentCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*note Like数:*\n${kpi.noteLikeCount}（+${
              kpi.noteLikeCount - previousWeekKpi.noteLikeCount
            })`,
          },
          {
            type: "mrkdwn",
            text: `*note フォロワー数:*\n${kpi.noteFollowerCount}（+${
              kpi.noteFollowerCount - previousWeekKpi.noteFollowerCount
            })`,
          },
        ],
        accessory: {
          type: "image",
          image_url:
            "https://drive.google.com/uc?id=1_R0p9YWUo3UsyjbyhzN6knKYYBnnJqJ1",
          alt_text: "note thumbnail",
        },
      },
      {
        type: "divider",
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `https://mobile.twitter.com/${TWITTER_USER_NAME}`,
        },
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Twitterフォロワー数:*\n${kpi.twitterFollowerCount}（+${
              kpi.twitterFollowerCount - previousWeekKpi.twitterFollowerCount
            })`,
          },
        ],
        accessory: {
          type: "image",
          image_url:
            "https://drive.google.com/uc?id=1R5__uM39n1cCOnIODr20WkK66x2UszYb",
          alt_text: "twitter thumbnail",
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
          text:
            recentQiitaPostsText +
              recentZennArticlesText +
              recentNoteContentsText || "なし",
        },
      },
      {
        type: "divider",
      },
    ],
  };
}
