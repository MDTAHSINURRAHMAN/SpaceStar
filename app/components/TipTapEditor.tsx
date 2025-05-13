"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import FontFamily from "@tiptap/extension-font-family";
import Color from "@tiptap/extension-color";
import FontSize from "tiptap-extension-font-size";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Heading1,
  Heading2,
  Quote,
  Code,
  Link as LinkIcon,
  Undo,
  Redo,
  Type,
  Text,
  Palette,
} from "lucide-react";
import { TipTapContent } from "@/types/story";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TipTapEditorProps {
  content: TipTapContent;
  onChange: (content: TipTapContent) => void;
  editable?: boolean;
}

const fontFamilies = [
  { name: "Default", value: "Inter, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Monospace", value: "Consolas, monospace" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Arial", value: "Arial, sans-serif" },
  {
    name: "Helvetica Now Display",
    value: "'Helvetica Now Display', sans-serif",
  },
];

const fontSizes = [
  { name: "Small", value: "14px" },
  { name: "Default", value: "16px" },
  { name: "Medium", value: "18px" },
  { name: "Large", value: "20px" },
  { name: "Extra Large", value: "24px" },
];

const TipTapEditor = ({
  content,
  onChange,
  editable = true,
}: TipTapEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class:
            "text-blue-500 underline hover:text-blue-600 transition-colors",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontFamily,
      Color.configure({
        types: ["textStyle"],
      }),
      FontSize,
    ],
    content,
    editable,
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as TipTapContent);
    },
  });

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleFontFamilyChange = (value: string) => {
    editor.chain().focus().setFontFamily(value).run();
  };

  const handleFontSizeChange = (value: string) => {
    editor.chain().focus().setFontSize(value).run();
  };

  return (
    <div className="border rounded-lg shadow-sm bg-white overflow-hidden">
      {editable && (
        <div className="flex flex-wrap items-center gap-2 p-3 border-b bg-gray-50">
          {/* Font controls */}
          <div className="flex items-center gap-3 mr-3 border-r pr-3">
            <div className="flex items-center gap-1.5">
              <Type className="h-4 w-4 text-gray-500" />
              <Select onValueChange={handleFontFamilyChange}>
                <SelectTrigger className="h-8 w-[130px]">
                  <SelectValue placeholder="Font" />
                </SelectTrigger>
                <SelectContent>
                  {fontFamilies.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <span style={{ fontFamily: font.value }}>
                        {font.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1.5">
              <Text className="h-4 w-4 text-gray-500" />
              <Select onValueChange={handleFontSizeChange}>
                <SelectTrigger className="h-8 w-[110px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  {fontSizes.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Text formatting */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("bold") ? "bg-gray-200" : ""
              }`}
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("italic") ? "bg-gray-200" : ""
              }`}
            >
              <Italic className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-gray-100 transition-colors"
              >
                <input
                  type="color"
                  onChange={(e) =>
                    editor.chain().focus().setColor(e.target.value).run()
                  }
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
                <Palette className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Headings */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("heading", { level: 1 }) ? "bg-gray-200" : ""
              }`}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("heading", { level: 2 }) ? "bg-gray-200" : ""
              }`}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Lists */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("bulletList") ? "bg-gray-200" : ""
              }`}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("orderedList") ? "bg-gray-200" : ""
              }`}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>

          {/* Block formatting */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("blockquote") ? "bg-gray-200" : ""
              }`}
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("codeBlock") ? "bg-gray-200" : ""
              }`}
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>

          {/* Text alignment */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: "left" }) ? "bg-gray-200" : ""
              }`}
            >
              <AlignLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("center").run()
              }
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: "center" }) ? "bg-gray-200" : ""
              }`}
            >
              <AlignCenter className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: "right" }) ? "bg-gray-200" : ""
              }`}
            >
              <AlignRight className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                editor.chain().focus().setTextAlign("justify").run()
              }
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive({ textAlign: "justify" }) ? "bg-gray-200" : ""
              }`}
            >
              <AlignJustify className="h-4 w-4" />
            </Button>
          </div>

          {/* Links and media */}
          <div className="flex items-center gap-1 border-r pr-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={setLink}
              className={`hover:bg-gray-100 transition-colors ${
                editor.isActive("link") ? "bg-gray-200" : ""
              }`}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const url = window.prompt("Image URL");
                if (url) {
                  editor.chain().focus().setImage({ src: url }).run();
                }
              }}
              className="hover:bg-gray-100 transition-colors"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </div>

          {/* History */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              className="hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              className="hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
      <div
        className={`p-4 ${editable ? "min-h-[200px]" : ""} prose max-w-none`}
      >
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default TipTapEditor;
