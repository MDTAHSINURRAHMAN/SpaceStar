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
import { TipTapContent as TipTapContentType } from "@/types/story";

interface TipTapContentDisplayProps {
  content: TipTapContentType;
}

const TipTapContent = ({ content }: TipTapContentDisplayProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: "text-blue-500 underline",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TextStyle,
      FontFamily,
      Color,
      FontSize,
    ],
    content,
    editable: false,
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="tiptap-content prose max-w-none">
      <EditorContent editor={editor} />
    </div>
  );
};

export default TipTapContent;
