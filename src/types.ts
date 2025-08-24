type MaybeNamespace<WithNamespace extends boolean = false> =
  WithNamespace extends true
    ? {
        namespace: string[];
      }
    : {};

export type Field<WithNamespace extends boolean = false> = (
  | StringField
  | NumberField
  | BooleanField
  | DateTimeField
  | ImageField
  | ReferenceField
  | RichTextField<WithNamespace>
  | ObjectField<WithNamespace>
  | PasswordField
) &
  MaybeNamespace<WithNamespace>;

export interface BaseField {
  label?: string | boolean;
  required?: boolean;
  indexed?: boolean;
  name: string;
  nameOverride?: string;
  description?: string;
  searchable?: boolean;
  uid?: boolean;
  list?: boolean;
}

export interface SitepinsField extends BaseField {
  type: "string" | "number" | "boolean" | "object" | "array";
  isTitle?: boolean;
  isBody?: boolean;
  options?: Option[];
}

export interface RichTextType<WithNamespace extends boolean = false>
  extends BaseField {
  type: "rich-text";
  templates?: RichTextTemplate[];
  parser?: {
    type: "markdown" | "mdx";
    skipEscaping?: "all" | "html";
  };
}

export interface RichTextField<WithNamespace extends boolean = false>
  extends BaseField {
  type: "rich-text";
  name: string;
  templates?: RichTextTemplate[];
  parser?: {
    type: "markdown" | "mdx";
    skipEscaping?: "all" | "html";
  };
}

export interface RichTextTemplate {
  name: string;
  label?: string;
  inline?: boolean;
  match?: {
    start: string;
    end: string;
    name?: string;
  };
  fields: Field[];
}

export interface Option {
  value: string;
  label: string;
}

export interface MDXElement {
  type: string;
  name?: string;
  props?: Record<string, any>;
  children?: MDXElement[];
}

export interface MDXRoot extends MDXElement {
  type: "root";
}

export interface MDXError extends MDXElement {
  type: "invalid_markdown";
  value: string;
  message: string;
  position?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface Template {
  name: string;
  match?: {
    start: string;
    end: string;
  };
}

// Field type definitions
export interface StringField extends BaseField {
  type: "string";
  options?: Option[] | string[];
  isTitle?: boolean;
  [key: string]: any; // Allow additional properties for flexibility
}

export interface NumberField extends BaseField {
  type: "number";
  options?: Option[] | string[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface BooleanField extends BaseField {
  type: "boolean";
  options?: Option[] | string[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface DateTimeField extends BaseField {
  type: "datetime";
  options?: Option[] | string[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface ImageField extends BaseField {
  type: "image";
  options?: Option[] | string[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface ReferenceField extends BaseField {
  type: "reference";
  options?: Option[] | string[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface ObjectField<WithNamespace extends boolean = false>
  extends BaseField {
  type: "object";
  fields: Field<WithNamespace>[];
  templates?: RichTextTemplate[];
  [key: string]: any; // Allow additional properties for flexibility
}

export interface PasswordField extends BaseField {
  type: "password";
  [key: string]: any; // Allow additional properties for flexibility
}
