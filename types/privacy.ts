export interface PrivacyContentBlock {
    title: string;
    description: string;
  }
  
  // TipTap node attributes
  export interface TipTapNodeAttrs {
    [key: string]: string | number | boolean | null;
  }
  
  // TipTap mark
  export interface TipTapMark {
    type: string;
    attrs?: TipTapNodeAttrs;
  }
  
  // TipTap node
  export interface TipTapNode {
    type: string;
    attrs?: TipTapNodeAttrs;
    content?: TipTapNode[];
    marks?: TipTapMark[];
    text?: string;
  }
  
  // TipTap JSON content type
  export interface TipTapContent {
    type: string;
    content: TipTapNode[];
  }
  
  export interface PrivacyEntry {
    _id: string;
    image: string; // S3 image URL
    content: TipTapContent;
    createdAt: string;
    updatedAt: string;
  }
  