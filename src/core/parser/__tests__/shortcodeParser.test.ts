import { RichTextField, RichTextTemplate, StringField } from "@/types";
import { describe, expect, it } from "vitest";
import { shortcodeParser } from "../parsers/shortcodeParser";

describe("parseShortcode", () => {
  const baseTemplate = {
    name: "signature",
    label: "Signature",
    match: {
      start: "{{<",
      end: ">}}",
    },
  };

  describe("with keyed field", () => {
    it("parses attributes", () => {
      const template: RichTextTemplate = {
        ...baseTemplate,
        fields: [
          {
            name: "foo",
            label: "foo label",
            type: "string",
          } as StringField,
        ],
      };

      const result = shortcodeParser('{{< signature foo="bar123">}}', template);
      expect(result).toEqual('<signature foo="bar123">\n</signature>');
    });
  });

  describe("with unkeyed attributes", () => {
    it("parses attributes", () => {
      const template: RichTextTemplate = {
        ...baseTemplate,
        fields: [
          {
            name: "_value",
            label: "Value",
            type: "string",
          } as StringField,
        ],
      };

      const result = shortcodeParser('{{< signature "bar123" >}}', template);
      expect(result).toEqual('<signature _value="bar123">\n</signature>');
    });
  });

  describe("with children", () => {
    it("parses children field", () => {
      const template: RichTextTemplate = {
        ...baseTemplate,
        fields: [
          {
            name: "children",
            label: "children",
            type: "rich-text",
          } as RichTextField,
        ],
      };

      const result = shortcodeParser(
        "{{< signature >}}\n# FOO\n##Bar\n{{< /signature >}}",
        template
      );
      expect(result).toEqual("<signature >\n# FOO\n##Bar\n</signature>");
    });
  });
});
