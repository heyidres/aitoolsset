/**
 * Rich text editor — TipTap (built on ProseMirror).
 *
 * Toolbar: H2, H3, Bold, Italic, Bullet list, Numbered list,
 * Blockquote, Link, Unlink, Clear formatting.
 *
 * Emits HTML on every change so the parent form can submit it
 * as a normal field value. Hidden <input> mirrors the HTML so
 * native FormData on submit picks it up without any extra JS.
 */

"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

type Props = {
  /** Form field name — what gets serialised in the FormData submission. */
  name: string;
  /** Initial HTML. */
  defaultValue?: string;
  /** Placeholder shown when empty. */
  placeholder?: string;
};

/**
 * Imperative handle exposed to parents that need to inject HTML at
 * the cursor (e.g. the BlogForm's "+ Insert tool card" / "+ Insert
 * block" buttons). Required because TipTap owns its own internal
 * doc state — mutating `defaultValue` from the parent has no effect
 * after mount.
 */
export type RichTextEditorHandle = {
  insertContent: (html: string) => void;
  focus: () => void;
};

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  { name, defaultValue = "", placeholder },
  ref
) {
  const [html, setHtml] = useState(defaultValue);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "rte-link",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write something…",
      }),
      // Tables — paste from Google Docs / Notion / Excel now renders
      // as a real <table> instead of plain text. resizable: true gives
      // editors drag handles to adjust column widths.
      Table.configure({
        resizable: true,
        HTMLAttributes: { class: "rte-table" },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: defaultValue,
    editorProps: {
      attributes: {
        class: "rte-content",
      },
    },
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    immediatelyRender: false,
  });

  // Keep state in sync if defaultValue changes externally (e.g. tab swap)
  useEffect(() => {
    if (editor && defaultValue && editor.getHTML() !== defaultValue) {
      editor.commands.setContent(defaultValue, { emitUpdate: false });
      setHtml(defaultValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  /**
   * Expose imperative `insertContent` / `focus` to parent refs.
   * insertContent uses TipTap's parser, so `<p>[[tool:slug]]</p>`
   * lands as a real paragraph node (not raw text) at the cursor.
   */
  useImperativeHandle(
    ref,
    () => ({
      insertContent: (incoming: string) => {
        if (!editor) return;
        // Focus first so the insertion point is the actual cursor — not
        // the document end. Then insert and let onUpdate sync `html`.
        editor.chain().focus("end").insertContent(incoming).run();
      },
      focus: () => editor?.commands.focus("end"),
    }),
    [editor]
  );

  if (!editor) {
    return <div className="rte-skeleton" />;
  }

  return (
    <div className="rte">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <input type="hidden" name={name} value={html} />
    </div>
  );
});

function Toolbar({ editor }: { editor: Editor }) {
  const setLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave blank to remove)", prev ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    const safe = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange("link").setLink({ href: safe }).run();
  }, [editor]);

  const Btn = ({
    label,
    title,
    onClick,
    active,
    children,
  }: {
    label?: string;
    title: string;
    onClick: () => void;
    active?: boolean;
    children?: React.ReactNode;
  }) => (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      onClick={onClick}
      className={`rte-btn${active ? " active" : ""}`}
    >
      {children ?? label}
    </button>
  );

  return (
    <div className="rte-toolbar" role="toolbar">
      <Btn
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <span style={{ fontWeight: 800 }}>H2</span>
      </Btn>
      <Btn
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <span style={{ fontWeight: 800 }}>H3</span>
      </Btn>
      <div className="rte-sep" />
      <Btn
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </Btn>
      <Btn
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </Btn>
      <Btn
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <span style={{ textDecoration: "line-through" }}>S</span>
      </Btn>
      <div className="rte-sep" />
      <Btn
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <circle cx="4" cy="6" r="1" fill="currentColor" />
          <circle cx="4" cy="12" r="1" fill="currentColor" />
          <circle cx="4" cy="18" r="1" fill="currentColor" />
        </svg>
      </Btn>
      <Btn
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <line x1="10" y1="6" x2="21" y2="6" />
          <line x1="10" y1="12" x2="21" y2="12" />
          <line x1="10" y1="18" x2="21" y2="18" />
          <path d="M4 6h1v4" />
          <path d="M4 10h2" />
          <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
        </svg>
      </Btn>
      <Btn
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
          <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </Btn>
      <div className="rte-sep" />
      <Btn title="Insert link" active={editor.isActive("link")} onClick={setLink}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.71" />
        </svg>
      </Btn>
      <Btn
        title="Remove link"
        onClick={() => editor.chain().focus().unsetLink().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M5.17 11.75L3.44 13.46a5 5 0 0 0 7.07 7.07l1.72-1.71" />
          <line x1="2" y1="22" x2="22" y2="2" />
        </svg>
      </Btn>
      <div className="rte-sep" />
      <Btn
        title="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </Btn>
      {editor.isActive("table") && (
        <>
          <Btn title="Add row below" onClick={() => editor.chain().focus().addRowAfter().run()}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>+ Row</span>
          </Btn>
          <Btn title="Add column right" onClick={() => editor.chain().focus().addColumnAfter().run()}>
            <span style={{ fontSize: 11, fontWeight: 700 }}>+ Col</span>
          </Btn>
          <Btn title="Delete row" onClick={() => editor.chain().focus().deleteRow().run()}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)" }}>− Row</span>
          </Btn>
          <Btn title="Delete column" onClick={() => editor.chain().focus().deleteColumn().run()}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)" }}>− Col</span>
          </Btn>
          <Btn title="Delete table" onClick={() => editor.chain().focus().deleteTable().run()}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--red)" }}>✕ Table</span>
          </Btn>
        </>
      )}
      <div className="rte-sep" />
      <Btn
        title="Clear formatting"
        onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M4 7V4h16v3" />
          <line x1="5" y1="20" x2="11" y2="20" />
          <line x1="13" y1="4" x2="8" y2="20" />
        </svg>
      </Btn>
    </div>
  );
}
