import { fetchAll, afterResponse, beforeResponse } from '../apiBase/APIResponsePaging';
import Listing from './Listing';
import SubredditEndpoint from '../apis/SubredditEndpoint';

// subreddit's uuid is the clean name but for paging we need the thing id
export const subredditAfter = (apiResponse) => {
  const after = afterResponse(apiResponse);
  if (!after) { return after; }
  return apiResponse.subreddits[after].name;
};

export const subredditPrev = (apiResponse) => {
  const before = beforeResponse(apiResponse);
  if (!before) { return before; }
  return apiResponse.subreddits[before].name;
};

export class SubredditList extends Listing {
  static sortFromOptions = () => {}
  static sort = '';
  static limit = 100;
  static endpoint = SubredditEndpoint;

  static baseOptions(apiOptions) {
    return {
      sort: this.sortFromOptions(apiOptions) || this.sort,
      limit: this.limit,
      sr_detail: true,
    };
  }

  static async fetch(apiOptions, all=true) {
    if (all) {
      const { get } = SubredditEndpoint;
      const allMergedSubreddits = await fetchAll(get, apiOptions,
          this.baseOptions(apiOptions), subredditAfter);

      return new this(allMergedSubreddits);
    }

    const firstPage = await this.getResponse(apiOptions);
    return new this(firstPage);
  }

  get subreddits() {
    return this.apiResponse.results.map(this.apiResponse.getModelFromRecord);
  }

  afterId(apiResponse) {
    return subredditAfter(apiResponse);
  }

  prevId(apiResponse) {
    return subredditPrev(apiResponse);
  }
}

export class SubscribedSubreddits extends SubredditList {
  static sortFromOptions = (apiOptions) => {
    if (apiOptions.token) {
      return 'mine/subscriber';
    }

    return 'default';
  }
}

export class ModeratingSubreddits extends SubredditList {
  static sort = 'mine/moderator';
}

export class ContributingSubreddits extends SubredditList {
  static sort = 'mine/contributor';
}
