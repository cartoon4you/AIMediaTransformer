
export enum MediaType {
  IMAGE,
  VIDEO,
  NONE,
}

export type TransformedMedia = {
  url: string;
  type: MediaType;
};
