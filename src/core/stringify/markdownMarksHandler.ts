import type { RichTextType } from "@/types";
import type * as Md from "mdast";
import type * as Plate from "../parser/types/plateTypes";
import { serializeInlineProps } from "./mdxAttributeSerializer";
import { MarkCounts, MarkType } from "./types";

/**
 * Markdown marks processing utilities for converting Plate inline elements to MDAST nodes.
 * Handles text formatting (bold, italic, code, strikethrough) and other inline elements.
 */

// Base interface for all inline elements
interface BaseInlineNode {
  type?: string;
  text?: string;
  linkifyTextNode?: (arg: Md.Text) => Md.Link;
  children?: Plate.InlineElement[];
}

// Specific inline node types
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

interface MdxJsxTextNode extends BaseInlineNode {
  type: "mdxJsxTextElement";
  name: string | null;
  props: Record<string, unknown>;
  children: [Plate.EmptyTextElement];
}

interface HtmlInlineNode extends BaseInlineNode {
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

// Union type for all processable inline elements
type InlineNodeWithCallback =
  | LinkNode
  | ImageNode
  | MdxJsxTextNode
  | HtmlInlineNode
  | TextNode
  | BreakNode;

// Simple text content interface
interface TextContent {
  text: string;
}

// Utility functions
const hasCommonElements = (a: string[], b: string[]): boolean => {
  return a.some((element) => b.includes(element));
};

function createMdTextNode(content: TextContent): Md.Text {
  return {
    type: "text",
    value: content.text,
  };
}

// Type guard functions
function isLinkNode(node: InlineNodeWithCallback): node is LinkNode {
  return node.type === "a" && "url" in node && typeof node.url === "string";
}

function isImageNode(node: InlineNodeWithCallback): node is ImageNode {
  return node.type === "img" && "url" in node && typeof node.url === "string";
}

function isMdxJsxTextNode(
  node: InlineNodeWithCallback
): node is MdxJsxTextNode {
  return node.type === "mdxJsxTextElement" && "name" in node && "props" in node;
}

function isHtmlInlineNode(
  node: InlineNodeWithCallback
): node is HtmlInlineNode {
  return (
    node.type === "html_inline" &&
    "value" in node &&
    typeof node.value === "string"
  );
}

function isTextNode(node: InlineNodeWithCallback): node is TextNode {
  return (!node.type || node.type === "text") && typeof node.text === "string";
}

// Individual node handlers
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
  node: MdxJsxTextNode,
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

function handleHtmlInlineNode(node: HtmlInlineNode): Md.HTML {
  return {
    type: "html",
    value: node.value,
  };
}

// Main inline node handler with improved type safety
function handleInlineNode(
  node: InlineNodeWithCallback,
  field: RichTextType,
  imageUrlMapper: (url: string) => string
): Md.PhrasingContent {
  if (isLinkNode(node)) {
    throw new Error(
      'Unexpected node of type "a", link elements should be processed after all inline elements have resolved'
    );
  }

  if (isImageNode(node)) {
    return handleImageNode(node, imageUrlMapper);
  }

  if (node.type === "break") {
    return { type: "break" };
  }

  if (isMdxJsxTextNode(node)) {
    return handleMdxJsxTextNode(node, field, imageUrlMapper);
  }

  if (isHtmlInlineNode(node)) {
    return handleHtmlInlineNode(node);
  }

  if (isTextNode(node)) {
    return createMdTextNode({ text: node.text });
  }

  throw new Error(`InlineElement: ${(node as any).type} is not supported`);
}

// Mark processing utilities
function getNodeMarks(node: InlineNodeWithCallback): MarkType[] {
  const marks: MarkType[] = [];
  if (isTextNode(node)) {
    if (node.bold) marks.push("strong");
    if (node.italic) marks.push("emphasis");
    if (node.code) marks.push("inlineCode");
    if (node.strikethrough) marks.push("delete");
  }
  return marks;
}

function findFirstNonMatchingSiblingIndex(
  nodes: InlineNodeWithCallback[],
  marks: MarkType[]
): number {
  return nodes.findIndex((node) => {
    const nodeMarks = getNodeMarks(node);
    return !marks.every((mark) => nodeMarks.includes(mark));
  });
}

function getMarkCounts(
  siblings: InlineNodeWithCallback[],
  marks: MarkType[]
): MarkCounts {
  return marks.reduce((acc, mark) => {
    acc[mark] = siblings.reduce((count, node) => {
      const nodeMarks = getNodeMarks(node);
      return count + (nodeMarks.includes(mark) ? 1 : 0);
    }, 0);
    return acc;
  }, {} as MarkCounts);
}

function getMostCommonMark(counts: MarkCounts): MarkType | null {
  let highestCount = 0;
  let highestMark: MarkType | null = null;

  Object.entries(counts).forEach(([mark, count]) => {
    if (count && count > highestCount) {
      highestCount = count;
      highestMark = mark as MarkType;
    }
  });

  return highestMark;
}

// Main processing function with improved readability
export function processInlineNodes(
  nodes: InlineNodeWithCallback[],
  field: RichTextType,
  imageUrlMapper: (url: string) => string
): Md.PhrasingContent[] {
  if (!nodes || nodes.length === 0) {
    return [];
  }

  const content = convertLinksToTextNodes(nodes);
  const firstNode = content[0];

  if (!firstNode) {
    return [];
  }

  // Handle non-text nodes (they can't be merged with marks)
  if (firstNode.type !== "text") {
    if (firstNode.type === "a") {
      return [
        {
          type: "link",
          url: firstNode.url,
          title: firstNode.title,
          children: processInlineNodes(
            firstNode.children,
            field,
            imageUrlMapper
          ) as Md.StaticPhrasingContent[],
        },
        ...processInlineNodes(content.slice(1), field, imageUrlMapper),
      ];
    }

    return [
      handleInlineNode(firstNode, field, imageUrlMapper),
      ...processInlineNodes(content.slice(1), field, imageUrlMapper),
    ];
  }

  const marks = getNodeMarks(firstNode);

  // Handle nodes without marks
  if (marks.length === 0) {
    const textNode = createMdTextNode({ text: firstNode.text });
    const resultNode = firstNode.linkifyTextNode
      ? firstNode.linkifyTextNode(textNode)
      : textNode;

    return [
      resultNode,
      ...processInlineNodes(content.slice(1), field, imageUrlMapper),
    ];
  }

  // Find matching siblings for mark processing
  const nonMatchingIndex = findFirstNonMatchingSiblingIndex(content, marks);
  const siblings =
    nonMatchingIndex === -1 ? content : content.slice(0, nonMatchingIndex);
  const rest = nonMatchingIndex === -1 ? [] : content.slice(nonMatchingIndex);

  const counts = getMarkCounts(siblings, marks);
  const highestMark = getMostCommonMark(counts);

  if (!highestMark) {
    return [
      createMdTextNode(firstNode),
      ...processInlineNodes(content.slice(1), field, imageUrlMapper),
    ];
  }

  // Special handling for inline code (no nested marks allowed)
  if (highestMark === "inlineCode") {
    if (siblings.length > 1) {
      throw new Error("Marks inside inline code are not supported");
    }
    const codeNode: Md.InlineCode = {
      type: "inlineCode",
      value: firstNode.text,
    };
    const textNode = createMdTextNode({ text: firstNode.text });
    return [
      firstNode.linkifyTextNode?.(textNode) ?? codeNode,
      ...processInlineNodes(rest, field, imageUrlMapper),
    ];
  }

  // Process mark wrapper
  const children = siblings.map((node) => {
    const cleanedNode = removeMarkFromNode(node, highestMark);
    return handleInlineNode(cleanedNode, field, imageUrlMapper);
  });

  const wrapper = {
    type: highestMark,
    children,
  } as Md.PhrasingContent;

  return [wrapper, ...processInlineNodes(rest, field, imageUrlMapper)];
}

function removeMarkFromNode(
  node: InlineNodeWithCallback,
  mark: MarkType | null
): InlineNodeWithCallback {
  if (!mark || !isTextNode(node)) {
    return node;
  }

  const cleanedNode = { ...node };
  switch (mark) {
    case "strong":
      delete cleanedNode.bold;
      break;
    case "emphasis":
      delete cleanedNode.italic;
      break;
    case "inlineCode":
      delete cleanedNode.code;
      break;
    case "delete":
      delete cleanedNode.strikethrough;
      break;
  }
  return cleanedNode;
}

// Utility to convert simple link elements to text nodes with linkify callback
function convertLinksToTextNodes(
  nodes: (Plate.InlineElement | InlineNodeWithCallback)[]
): InlineNodeWithCallback[] {
  return (
    nodes?.map((item) => {
      if (isLinkNode(item) && item.children?.length === 1) {
        const firstChild = item.children[0];
        if (firstChild?.type === "text") {
          return {
            type: "text",
            text: firstChild.text,
            children: [{ type: "text", text: "" }],
            linkifyTextNode: (textNode) => ({
              type: "link",
              url: item.url || "",
              title: item.title,
              children: [textNode],
            }),
          } as TextNode;
        }
      }
      return item as InlineNodeWithCallback;
    }) || []
  );
}
