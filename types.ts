export type JsonValue = string | number | boolean | null | JsonObject | JsonArray;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonArray = JsonValue[];

export interface EditorState {
  text: string;
  parsed: JsonValue | undefined;
  error: string | null;
  errorIndex: number | null;
}

export type Theme = 'light' | 'dark';
export type Language = 'zh' | 'en';

export enum ViewMode {
  CODE = 'CODE',
  TREE = 'TREE'
}