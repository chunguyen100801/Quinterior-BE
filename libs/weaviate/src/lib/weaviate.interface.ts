export interface RoomImageSearchResult {
  image_url: string;
  certainty: number;
  prompt?: string;
  workspaceId?: number;
  seed?: number;
  numInferenceSteps?: number;
  guidanceScale?: number;
  negativePrompt?: string;
}

export interface RoomRandomSearchResult {
  image_url: string;
  prompt?: string;
  workspaceId?: number;
}

export interface InteriorImageSearchResult {
  image_url: string;
  certainty: number;
  name?: string;
  interiorImages?: string[];
  model?: string;
  productID?: number;
}

export interface InteriorTitleSearchResult {
  name: string;
  model: string;
  image_urls: string[];
  certainty: number;
}

// export interface InteriorTextSearchResult {
//   name: string;
//   model: string;
//   image_urls: string[];
//   certainty: number;
// }

export interface RoomPromptSearchResult {
  prompt: string;
  certainty: number;
  image_url: string;
}
