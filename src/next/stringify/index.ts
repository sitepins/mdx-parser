import type * as Plate from "@/core/parser/types";
import { RichTextField } from "@/types";
import { preProcess } from "./jsx-attribute-processor";
import { toTinaMarkdown } from "./markdown-renderer";

export const stringifyMDX = (
  value: Plate.RootElement,
  field: RichTextField,
  imageCallback: (url: string) => string
) => {
  if (!value) {
    return;
  }
  const mdTree = preProcess(value, field, imageCallback);
  return toTinaMarkdown(mdTree, field);
};
