import type * as Plate from "./core/parser/types/plateTypes";
import type { RichTextType } from "./types";

export declare function parseMDX(
  value: string,
  field: RichTextType,
  imageCallback: (s: string) => string
): Plate.RootElement;

export declare function stringifyMDX(
  value: Plate.RootElement,
  field: RichTextType
): string;

export * from "./core/parser/types/plateTypes";
export * from "./types";
