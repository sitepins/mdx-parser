# @sitepins/mdx-parser

A powerful Next.js-focused MDX parsing and transformation library with support for custom shortcodes, rich formatting, and advanced markdown features.

## Features

- Full MDX parsing and transformation
- Custom shortcode handling (WordPress-style)
- Rich text formatting with nested components
- Table formatting
- Image processing with callbacks
- Multiple rich text field support

## Getting Started

### 1. Installation

```bash
npm install @sitepins/mdx-parser
# or
yarn add @sitepins/mdx-parser
# or
pnpm add @sitepins/mdx-parser
```

### 2. Development Setup with Yarn Link

When developing or testing this package locally, you can use `yarn link` to create a symbolic link between your local development version and other projects.

#### Linking the Package (Development Mode)

1. **In the package directory** (this repository):
   ```bash
   # Navigate to the package directory
   cd /path/to/mdx-parser
   
   # Create a global link
   yarn link
   ```

2. **In your project directory** (where you want to use the linked package):
   ```bash
   # Navigate to your project
   cd /path/to/your-project
   
   # Link to the globally linked package
   yarn link @sitepins/mdx-parser
   ```

#### Unlinking the Package

When you're done testing or want to use the published version:

1. **In your project directory**:
   ```bash
   # Unlink the package
   yarn unlink @sitepins/mdx-parser
   
   # Reinstall the published version
   yarn add @sitepins/mdx-parser
   ```

2. **In the package directory** (optional):
   ```bash
   # Remove the global link
   yarn unlink
   ```

#### Alternative: Using npm link

If you prefer npm, you can use `npm link` instead:

```bash
# In the package directory
npm link

# In your project directory
npm link @sitepins/mdx-parser

# To unlink
npm unlink @sitepins/mdx-parser
npm install @sitepins/mdx-parser
```

#### Benefits of Yarn Link

- **Real-time testing**: Changes in the package are immediately available in linked projects
- **Development workflow**: Test fixes and features without publishing
- **Debugging**: Easier to debug issues in the context of real usage
- **Performance**: No need to rebuild and reinstall after every change

#### Important Notes

- **Global scope**: `yarn link` creates a global symbolic link, so be careful with package names
- **Version conflicts**: Linked packages might have different dependency versions
- **Build process**: Make sure to build the package (`yarn build`) before testing
- **Cleanup**: Always unlink when done to avoid confusion

### 3. Basic Usage

The library exports two main functions: `parseMDX` and `stringifyMDX`. Here's how to use them:

```typescript
import { parseMDX, stringifyMDX } from "@sitepins/mdx-parser";

// 1. Parse MDX to AST
const mdxContent = `
# Hello World

This is a **bold** text with an ![image](example.jpg)

{{ Alert type="warning" }}
  Watch out!
{{ /Alert }}
`;

// Parse MDX to AST
const ast = parseMDX(
  mdxContent,
  {
    type: "rich-text",
    // Optional: Add custom shortcode templates
    templates: [{
      name: 'Alert',
      fields: [{
        name: 'type',
        type: 'string'
      }]
    }]
  },
  // Image URL processing callback
  (imageUrl) => `/optimized/${imageUrl}`
);

// 2. Convert AST back to MDX
const output = stringifyMDX(
  ast,
  {
    type: "rich-text",
    name: "content",
    // Use the same templates as in parsing
    templates: [{
      name: 'Alert',
      fields: [{
        name: 'type',
        type: 'string'
      }]
    }]
  },
  // Image URL processing callback
  (url) => url
);
```

### 3. Function Parameters

#### parseMDX(value, field, imageCallback)
- `value`: (string) The MDX/Markdown content to parse
- `field`: (RichTextType) Configuration object:
  ```typescript
  {
    type: "rich-text";
    templates?: RichTextTemplate[]; // Optional shortcode templates
    parser?: {
      type: "markdown" | "mdx";
      skipEscaping?: "all" | "html";
    };
  }
  ```
- `imageCallback`: (function) Process image URLs before parsing
  ```typescript
  (imageUrl: string) => string
  ```

## Usage in React Applications

This library works in both Node.js and React environments. For React applications, the library automatically uses the browser-optimized bundle.

### React Usage Example

```typescript
import { parseMDX } from "@sitepins/mdx-parser";

function MyComponent() {
  const [parsedContent, setParsedContent] = useState(null);

  useEffect(() => {
    const field = {
      name: "body",
      type: "rich-text",
      parser: { type: "markdown", skipEscaping: "html" },
      templates: [
        {
          name: "Alert",
          label: "Alert Box",
          match: {
            start: "{{<",
            name: "alert",
            end: ">}}",
          },
          fields: [
            {
              name: "type",
              label: "Alert Type",
              type: "string",
            },
            {
              name: "children",
              label: "Content",
              type: "rich-text",
            },
          ],
        },
      ],
    };

    try {
      const result = parseMDX(
        `# Welcome to My App
        
        This is some **bold** text and *italic* text.
        
        {{< alert type="info" >}}
        This is an informational alert!
        {{< /alert >}}`,
        field,
        (imageUrl) => `/images/${imageUrl}`
      );
      
      setParsedContent(result);
    } catch (error) {
      console.error("Failed to parse MDX:", error);
    }
  }, []);

  return (
    <div>
      <h1>Parsed Content</h1>
      <pre>{JSON.stringify(parsedContent, null, 2)}</pre>
    </div>
  );
}
```

### Build Variants

The library provides two build variants:

1. **Node.js/ESM/CJS** (`index.mjs`, `index.js`) - For server-side usage with external dependencies
2. **Browser/React** (`index.browser.js`) - For client-side usage with bundled dependencies

The browser bundle automatically includes all necessary dependencies, making it perfect for React applications.

#### stringifyMDX(rootElement, richTextField, mapImageUrl)
- `rootElement`: (Plate.RootElement) The AST to convert back to MDX
- `richTextField`: (RichTextField) Configuration object:
  ```typescript
  {
    type: "rich-text";
    name: string;
    templates?: RichTextTemplate[];
    parser?: {
      type: "markdown" | "mdx";
      skipEscaping?: "all" | "html";
    };
  }
  ```
- `mapImageUrl`: (function) Process image URLs during stringification
  ```typescript
  (imageUrl: string) => string
  ```

## API Reference

### parseMDX

Converts MDX/Markdown text to an AST (Abstract Syntax Tree).

```typescript
export const parseMDX = (
  value: string,
  field: RichTextType,
  imageCallback: (s: string) => string
): Plate.RootElement => {}
```

#### Parameters:
- `value`: The MDX/Markdown string to parse
- `field`: Configuration object for the parser
- `imageCallback`: Function to process image URLs

#### RichTextType Interface:
```typescript
export interface RichTextType<WithNamespace extends boolean = false>
  extends BaseField {
  type: "rich-text";
  templates?: RichTextTemplate[];
  parser?: {
    type: "markdown" | "mdx";
    skipEscaping?: "all" | "html";
  };
}
```

#### Basic Usage:

```typescript
import { parseMDX } from '@sitepins/mdx-parser';

// Simple parsing
const mdxContent = '# Hello World';
const parsed = parseMDX(mdxContent, {
  type: "rich-text"
}, url => url);

// With options
const result = parseMDX(mdxContent, {
  type: "rich-text",
  parser: {
    type: "mdx",
    skipEscaping: "html" 
  }
}, url => url);
```

### stringifyMDX

Converts an AST (Abstract Syntax Tree) back to MDX/Markdown text.

```typescript
export const stringifyMDX = (
  rootElement: Plate.RootElement,
  richTextField: RichTextField,
  mapImageUrl: (url: string) => string
) 
```

#### Parameters:
- `rootElement`: The root AST node to stringify
- `richTextField`: Configuration object for the stringification
- `mapImageUrl`: Function to process image URLs

#### RichTextField Interface:
```typescript
export interface RichTextField extends BaseField {
  type: "rich-text";
  name: string;
  templates?: RichTextTemplate[];
  parser?: {
    type: "markdown" | "mdx";
    skipEscaping?: "all" | "html";
  };
}
```

#### Example:

```typescript
import { parseMDX, stringifyMDX } from '@sitepins/mdx-parser';

// Parse MDX to AST
const mdxContent = '# Hello World';
const ast = parseMDX(mdxContent);

// Convert AST back to MDX string
const field = { 
  type: "rich-text",
  name: "content"
};
const mdxString = stringifyMDX(ast, field, (url) => url);
```

## Working with Shortcodes

### Basic Shortcodes

```typescript
import { parseMDX } from "@sitepins/mdx-parser";

// Define shortcode template
const templates = [{
  name: 'WarningCallout',
  match: {
    start: '{{',
    end: '}}'
  },
  fields: [{
    name: 'content',
    type: 'string'
  }]
}];

// Use in content
const content = `{{ WarningCallout content="This is a warning message!" }}`;
const result = parseMDX(content, { 
  type: "rich-text",
  templates 
}, url => url);
```

### Rich Text Shortcodes

```typescript
const richTextTemplate = {
  name: 'ContentBox',
  match: {
    start: '{{% ',
    end: ' %}}'
  },
  fields: [{
    name: 'children',
    type: 'rich-text'
  }]
};

const content = `
{{% ContentBox %}}
# Nested Content
This content supports **markdown** formatting
{{% /ContentBox %}}
`;

const result = parseMDX(content, {
  type: "rich-text",
  templates: [richTextTemplate]
}, url => url);
```

### Raw String Shortcodes

```typescript
const rawTemplate = {
  name: 'myshortcode',
  match: {
    start: '{{',
    end: '}}'
  },
  fields: [{
    name: '_value',
    type: 'string'
  }]
};

const rawContent = '{{ myshortcode "This is some raw text" }}';
const result = parseMDX(rawContent, {
  type: "rich-text",
  templates: [rawTemplate]
}, url => url);
```

### Special Cases

#### Shortcode Names with Dashes

```typescript
const dashedTemplate = {
  name: 'myshortcode',
  match: {
    start: '{{',
    end: '}}',
    name: 'my-shortcode' // Handle dashed names
  }
};

const content = '{{ my-shortcode "Content with dashed name" }}';
const result = parseMDX(content, {
  type: "rich-text",
  templates: [dashedTemplate]
}, url => url);
```

## Advanced Features

### Image Processing

```typescript
const content = `![Alt text](image.jpg)`;

const imageCallback = (src: string) => {
  // Process image URL or transform image
  return `/processed/${src}`;
};

const result = parseMDX(content, {
  type: "rich-text"
}, imageCallback);
```

### Table Support

```typescript
const content = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
`;

const result = parseMDX(content, { 
  type: "rich-text",
  parser: {
    type: "markdown"
  }
}, url => url);
```

const result = parseMDX(content, { 
  type: "rich-text",
  parser: {
    type: "markdown"
  }
}, url => url);
```

### Complex Example with Components

```typescript
const contentWithComponent = `
<ContentBox title="Important Information">
  # Nested Content
  This content supports **markdown** formatting
  
  - List item 1
  - List item 2
  
  ![Example Image](example.jpg)
</ContentBox>
`;

const parsedContent = parseMDX(contentWithComponent, {
  type: "rich-text",
  templates: [{
    name: 'ContentBox',
    fields: [
      {
        name: 'title',
        type: 'string'
      },
      {
        name: 'children',
        type: 'rich-text'
      }
    ]
  }]
}, url => url);

const convertedBack = stringifyMDX(parsedContent, {
  type: "rich-text",
  name: "content",
  templates: [{
    name: 'ContentBox',
    fields: [
      {
        name: 'title',
        type: 'string'
      },
      {
        name: 'children',
        type: 'rich-text'
      }
    ]
  }]
}, (url) => `/optimized/${url}`);
```

## Testing

```bash
npm test
# or
yarn test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT License](LICENSE)