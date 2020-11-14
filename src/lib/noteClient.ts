import {
  NoteContent,
  NoteContentsResponse,
  NoteUserResponse,
} from "../types/noteTypes";
import { NoteKpi } from "../types/types";

declare const Moment: {
  moment(arg?: any): any;
};

export class NoteClient {
  private readonly BASE_URL = "https://note.com";
  private readonly BASE_API_URL = "https://note.com/api/v2";

  constructor(private userName: string) {}

  fetchKpi(): NoteKpi {
    const user = this.fetchUser();
    const contents = this.fetchAllContent();

    return {
      noteContentCount: user.noteCount,
      noteFollowerCount: user.followerCount,
      noteLikeCount: this.tallyUpLikeCount(contents),
    };
  }

  fetchWeeklyContents(): NoteContent[] {
    const contents = this.fetchAllContent();
    return contents.filter((content) => {
      return Moment.moment(content.publishAt).isAfter(
        Moment.moment().add(-7, "days")
      );
    });
  }

  private fetchUser() {
    const response = UrlFetchApp.fetch(
      `${this.BASE_API_URL}/creators/${this.userName}`
    );
    return (JSON.parse(response.getContentText()) as NoteUserResponse).data;
  }

  private fetchAllContent() {
    let contents = [] as NoteContent[];
    let isLastPage = false;
    for (let page = 1; !isLastPage; page++) {
      const response = this.fetchContents(page);
      //
      const contentsIncludeUrl = response.data.contents.map((content) => {
        return {
          ...content,
          url: `${this.BASE_URL}/${this.userName}/n/${content.key}`,
        };
      });
      isLastPage = response.data.isLastPage;
      contents = [...contents, ...contentsIncludeUrl];
    }
    return contents;
  }

  private fetchContents(page: number) {
    const response = UrlFetchApp.fetch(
      `${this.BASE_API_URL}/creators/${this.userName}/contents?kind=note&page=${page}`
    );
    return JSON.parse(response.getContentText()) as NoteContentsResponse;
  }

  private tallyUpLikeCount(contents: NoteContent[]) {
    const likeCount = contents.reduce(
      (result, content) => result + content.likeCount,
      0
    );
    return likeCount;
  }
}

function testNoteClient() {
  const res = new NoteClient("ryo_kawamata").fetchKpi();
  console.log(JSON.stringify(res));
}
