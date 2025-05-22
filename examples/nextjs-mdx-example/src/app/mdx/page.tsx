import { parseMDX } from "@sitepins/mdx-parser";
import fs from "fs";
import path from "path";

export default async function MdxPage() {
  // Read the MDX file
  const mdxPath = path.join(process.cwd(), "src/app/content/example.mdx");
  const content = await fs.promises.readFile(mdxPath, "utf-8");

  // Parse the MDX content
  const parsedContent = parseMDX(
    content,
    {
      label: "rich text",
      name: "templates",
      type: "rich-text",
      templates: [],
    },
    (src: string) => src
  );

  return (
    <main className="container mx-auto px-4 py-8 prose prose-lg">
      {JSON.stringify(parsedContent, null, 2)}
    </main>
  );
}
