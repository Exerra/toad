export interface BingSearch {
    _type:           string;
    queryContext:    QueryContext;
    webPages:        WebPages;
    rankingResponse: RankingResponse;
}

export interface QueryContext {
    originalQuery:           string;
    alteredQuery:            string;
    alterationDisplayQuery:  string;
    alterationOverrideQuery: string;
    adultIntent:             boolean;
}

export interface RankingResponse {
    mainline: Mainline;
}

export interface Mainline {
    items: Item[];
}

export interface Item {
    answerType:  AnswerType;
    resultIndex: number;
    value:       ItemValue;
}

export enum AnswerType {
    WebPages = "WebPages",
}

export interface ItemValue {
    id: string;
}

export interface WebPages {
    webSearchUrl:          string;
    totalEstimatedMatches: number;
    value:                 ValueElement[];
    someResultsRemoved:    boolean;
}

export interface ValueElement {
    id:                        string;
    name:                      string;
    url:                       string;
    datePublished?:            Date;
    datePublishedDisplayText?: string;
    isFamilyFriendly:          boolean;
    displayUrl:                string;
    snippet:                   string;
    deepLinks?:                DeepLink[];
    dateLastCrawled:           Date;
    cachedPageUrl?:            string;
    language:                  Language;
    isNavigational:            boolean;
    noCache:                   boolean;
    siteName:                  string;
    thumbnailUrl?:             string;
    primaryImageOfPage?:       PrimaryImageOfPage;
}

export interface DeepLink {
    name:    string;
    url:     string;
    snippet: string;
}

export enum Language {
    En = "en",
    Ja = "ja",
}

export interface PrimaryImageOfPage {
    thumbnailUrl: string;
    width:        number;
    height:       number;
    imageId:      string;
}
