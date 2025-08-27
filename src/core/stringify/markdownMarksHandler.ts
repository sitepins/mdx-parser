import { stringifyPropsInline } from "@/next/stringify/jsx-attribute-processor";
import type { RichTextType } from "@/types";
import type * as Md from "mdast";
import type * as Plate from "../parser/types/plateTypes";
import { serializeInlineProps } from "./mdxAttributeSerializer";

export type MarkKind = "strong" | "emphasis" | "inlineCode" | "delete";
export type MarkCountMap = Partial<Record<MarkKind, number>>;

interface BaseInlineNode {
  type?: string;
  text?: string;
  linkifyTextNode?: (arg: Md.Text) => Md.Link;
  children?: Plate.InlineElement[];
}

interface LinkNode extends BaseInlineNode {
  type: "a";
  url: string;
  title?: string | null;
  children: Plate.InlineElement[];
}

interface ImageNode extends BaseInlineNode {
  type: "img";
  url: string;
  alt?: string;
  caption?: string | null;
  children: [Plate.EmptyTextElement];
}

interface MdxNode extends BaseInlineNode {
  type: "mdxJsxTextElement";
  name: string | null;
  props: Record<string, unknown>;
  children: [Plate.EmptyTextElement];
}

interface HtmlNode extends BaseInlineNode {
  type: "html_inline";
  value: string;
  children: [Plate.EmptyTextElement];
}

interface TextNode extends BaseInlineNode {
  type: "text";
  text: string;
  bold?: boolean;
  italic?: boolean;
  code?: boolean;
  strikethrough?: boolean;
}

interface BreakNode extends BaseInlineNode {
  type: "break";
  children: [Plate.EmptyTextElement];
}

type InlineNodeWithCallback =
  | LinkNode
  | ImageNode
  | MdxNode
  | HtmlNode
  | TextNode
  | BreakNode;

interface TextContentValue {
  text: string;
}

const arrayMatches = (a: string[], b: string[]): boolean => {
  return a.some((v) => b.includes(v));
};

function createMdTextNode(content: TextContentValue): Md.Text {
  return {
    type: "text",
    value: content.text,
  };
}

function isLinkNode(node: InlineNodeWithCallback): node is LinkNode {
  return node.type === "a" && "url" in node && typeof node.url === "string";
}

function isImageNode(node: InlineNodeWithCallback): node is ImageNode {
  return node.type === "img" && "url" in node && typeof node.url === "string";
}

function isMdxNode(node: InlineNodeWithCallback): node is MdxNode {
  return node.type === "mdxJsxTextElement" && "name" in node && "props" in node;
}

function isHtmlNode(node: InlineNodeWithCallback): node is HtmlNode {
  return (
    node.type === "html_inline" &&
    "value" in node &&
    typeof node.value === "string"
  );
}

function isTextNode(node: InlineNodeWithCallback): node is TextNode {
  return (!node.type || node.type === "text") && typeof node.text === "string";
}

function handleLinkNode(
  node: LinkNode,
  field: RichTextType,
  imageUrlMapper: (url: string) => string
): Md.Link {
  return {
    type: "link",
    url: node.url,
    title: node.title,
    children: processInlineNodes(
      node.children as InlineNodeWithCallback[],
      field,
      imageUrlMapper
    ) as Md.StaticPhrasingContent[],
  };
}

const handleInlineNode = (
  content: InlineNodeWithCallback,
  field: RichTextType,
  imageCallback: (url: string) => string
): Md.PhrasingContent => {
  switch (content.type) {
    case "a":
      throw new Error(
        `Unexpected node of type "a", link elements should be processed after all inline elements have resolved`
      );
    case "img":
      return {
        type: "image",
        url: imageCallback(content.url),
        alt: content.alt,
        title: content.caption,
      };
    case "break":
      return {
        type: "break",
      };
    case "mdxJsxTextElement": {
      const { attributes, children } = stringifyPropsInline(
        content,
        field,
        imageCallback
      );
      return {
        type: "mdxJsxTextElement",
        name: content.name,
        attributes,
        children,
      };
    }
    case "html_inline": {
      return {
        type: "html",
        value: content.value,
      };
    }
    default:
      if (isTextNode(content)) {
        return createMdTextNode({ text: content.text });
      }

      // @ts-expect-error type is 'never'
      throw new Error(`InlineElement: ${content.type} is not supported`);
  }
};

function handleImageNode(
  node: ImageNode,
  imageUrlMapper: (url: string) => string
): Md.Image {
  return {
    type: "image",
    url: imageUrlMapper(node.url),
    alt: node.alt,
    title: node.caption,
  };
}

function handleMdxJsxTextNode(
  node: MdxNode,
  field: RichTextType,
  imageUrlMapper: (url: string) => string
): Md.PhrasingContent {
  const { attributes, children } = serializeInlineProps(
    {
      type: "mdxJsxTextElement",
      name: node.name,
      props: node.props,
      children: node.children,
    },
    field,
    imageUrlMapper
  );
  return {
    type: "mdxJsxTextElement",
    name: node.name,
    attributes,
    children,
  } as Md.PhrasingContent;
}

function handleInlineHtmlNode(node: HtmlNode): Md.HTML {
  return {
    type: "html",
    value: node.value,
  };
}

function getNodeMarks(node: InlineNodeWithCallback): MarkKind[] {
  const marks: MarkKind[] = [];
  if (node.type !== "text") {
    return [];
  }
  if (node.bold) {
    marks.push("strong");
  }
  if (node.italic) {
    marks.push("emphasis");
  }
  if (node.code) {
    marks.push("inlineCode");
  }
  if (node.strikethrough) {
    marks.push("delete");
  }
  return marks;
}

function findFirstNonMatchingSiblingIndex(
  nodes: InlineNodeWithCallback[],
  marks: MarkKind[]
): number {
  const index = nodes.findIndex(
    (item) => !arrayMatches(marks, getNodeMarks(item))
  );
  return index === -1 ? nodes.length - 1 : index;
}

function getMarkCounts(
  siblings: InlineNodeWithCallback[],
  marks: MarkKind[]
): MarkCountMap {
  const counts: MarkCountMap = {};

  marks.forEach((mark) => {
    let count = 1;
    siblings.every((sibling, index) => {
      if (getNodeMarks(sibling).includes(mark)) {
        count = index + 2;
        return true;
      }
      return false;
    });
    counts[mark] = count;
  });

  return counts;
}

function getMarkWithHighestCount(counts: MarkCountMap): MarkKind | null {
  let maxCount = 0;
  let selectedMark: MarkKind | null = null;

  Object.entries(counts).forEach(([mark, count]) => {
    if (count && count > maxCount) {
      maxCount = count;
      selectedMark = mark as MarkKind;
    }
  });

  return selectedMark;
}

export const processInlineNodes = (
  c: InlineNodeWithCallback[],
  field: RichTextType,
  imageCallback: (url: string) => string
): Md.PhrasingContent[] => {
  const content = convertLinksToTextNodes(c);
  const first = content[0];
  if (!first) {
    return [];
  }
  if (first && first?.type !== "text") {
    if (first.type === "a") {
      return [
        {
          type: "link",
          url: first.url,
          title: first.title,
          children: processInlineNodes(
            first.children,
            field,
            imageCallback
          ) as Md.StaticPhrasingContent[],
        },
        ...processInlineNodes(content.slice(1), field, imageCallback),
      ];
    }
    // non-text nodes can't be merged. Eg. img, break. So process them and move on to the rest
    return [
      handleInlineNode(first, field, imageCallback),
      ...processInlineNodes(content.slice(1), field, imageCallback),
    ];
  }
  const marks = getNodeMarks(first);

  if (marks.length === 0) {
    if (first.linkifyTextNode) {
      return [
        first.linkifyTextNode(createMdTextNode({ text: first.text })),
        ...processInlineNodes(content.slice(1), field, imageCallback),
      ];
    } else {
      return [
        createMdTextNode(first),
        ...processInlineNodes(content.slice(1), field, imageCallback),
      ];
    }
  }
  let nonMatchingSiblingIndex: number = 0;
  if (
    content.slice(1).every((content, index) => {
      if (arrayMatches(marks, getNodeMarks(content))) {
        return true;
      } else {
        nonMatchingSiblingIndex = index;
        return false;
      }
    })
  ) {
    // Every sibling matches, so capture all of them in this node
    nonMatchingSiblingIndex = content.length - 1;
  }
  const matchingSiblings = content.slice(1, nonMatchingSiblingIndex + 1);
  const markCounts: {
    [key in "strong" | "emphasis" | "inlineCode" | "delete"]?: number;
  } = {};
  marks.forEach((mark) => {
    let count = 1;
    matchingSiblings.every((sibling, index) => {
      if (getNodeMarks(sibling).includes(mark)) {
        count = index + 1;
        return true;
      }
    });
    markCounts[mark] = count;
  });
  let count = 0;
  let markToProcess: "strong" | "emphasis" | "inlineCode" | "delete" | null =
    null;
  Object.entries(markCounts).forEach(([mark, markCount]) => {
    const m = mark as "strong" | "emphasis" | "inlineCode" | "delete";
    if (markCount > count) {
      count = markCount;
      markToProcess = m;
    }
  });
  if (!markToProcess) {
    return [
      createMdTextNode(first),
      ...processInlineNodes(content.slice(1), field, imageCallback),
    ];
  }
  if (markToProcess === "inlineCode") {
    if (nonMatchingSiblingIndex) {
      throw new Error("Marks inside inline code are not supported");
    }
    const node = {
      type: markToProcess,
      value: first.text,
    };
    return [
      first.linkifyTextNode?.(node) ?? node,
      ...processInlineNodes(
        content.slice(nonMatchingSiblingIndex + 1),
        field,
        imageCallback
      ),
    ];
  }

  return [
    {
      type: markToProcess,
      children: processInlineNodes(
        [
          ...[first, ...matchingSiblings].map((sibling) =>
            removeMarkFromNode(sibling, markToProcess)
          ),
        ],
        field,
        imageCallback
      ),
    },
    ...processInlineNodes(
      content.slice(nonMatchingSiblingIndex + 1),
      field,
      imageCallback
    ),
  ];
};

function removeMarkFromNode(
  node: InlineNodeWithCallback,
  mark: MarkKind | null
): InlineNodeWithCallback {
  if (!mark) {
    return node;
  }

  const cleanedNode: Record<string, unknown> = {};
  const markToClear = {
    strong: "bold",
    emphasis: "italic",
    inlineCode: "code",
    delete: "strikethrough",
  }[mark as MarkKind];
  Object.entries(node).map(([key, value]) => {
    if (key !== markToClear) {
      cleanedNode[key] = value;
    }
  });
  if (node.linkifyTextNode) {
    cleanedNode.callback = node.linkifyTextNode;
  }
  return cleanedNode as Plate.InlineElement;
}

function convertLinksToTextNodes(
  nodes: (Plate.InlineElement | InlineNodeWithCallback)[]
): InlineNodeWithCallback[] {
  return nodes?.map((item) => {
    if (item.type === "a" && item.children?.length === 1) {
      const firstChild = item.children[0];
      if (firstChild?.type === "text") {
        return {
          type: "text",
          text: firstChild.text,
          children: [{ type: "text", text: "" }],
          linkifyTextNode: (textNode) => ({
            type: "link",
            url: (item as Plate.LinkElement).url || "",
            title: (item as Plate.LinkElement).title,
            children: [textNode],
          }),
        } as TextNode;
      }
    }
    return item as InlineNodeWithCallback;
  });
}
