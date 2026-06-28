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

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableCell } from "@tiptap/extension-table-cell";

/**
 * Normalise pasted HTML so tables coming from Google Docs / Notion /
 * Word / web pages survive TipTap's schema strict-parse and don't
 * collapse into plain paragraphs.
 *
 * Without this pass, Google Docs wraps every table in <div> + inline
 * `style="mso-..."` attributes plus a <colgroup> that TipTap's table
 * extension doesn't recognise. The parser then sees no valid table
 * structure and just keeps the text content, which is why pasted
 * "Comparison: X vs Y" tables ended up as paragraphs.
 *
 * What this does:
 *   1. Strip Office/Word/Google Docs noise (<o:p>, <w:*>, mso-*, font tags).
 *   2. Strip <colgroup>/<col> — not in TipTap's table schema.
 *   3. Wrap bare text content inside <td>/<th> in a <p>. TipTap's
 *      default cell content is `block+`; bare inline text is rejected.
 *   4. Promote first-row <td>s to <th> when no <thead> is present
 *      (Google Docs exports rarely include <thead>) so the table
 *      visually gets a header row.
 *   5. Drop `style=""` attributes — keeps the markup tidy + delegates
 *      visual styling to the public site's CSS.
 */
function transformPastedTablesHtml(html: string): string {
  if (!html) return html;
  let out = html;

  // 1. Strip Office/Word/Google Docs cruft.
  out = out.replace(/<o:p\b[^>]*>[\s\S]*?<\/o:p>/gi, "");
  out = out.replace(/<o:p\b[^>]*\/?>/gi, "");
  out = out.replace(/<w:[a-zA-Z]+\b[^>]*>[\s\S]*?<\/w:[a-zA-Z]+>/gi, "");
  out = out.replace(/<\?xml[\s\S]*?\?>/gi, "");
  out = out.replace(/<font\b[^>]*>([\s\S]*?)<\/font>/gi, "$1"); // unwrap <font>

  // 2. Drop <colgroup>/<col> — TipTap table schema rejects them.
  out = out.replace(/<colgroup\b[^>]*>[\s\S]*?<\/colgroup>/gi, "");
  out = out.replace(/<col\b[^>]*\/?>/gi, "");

  // 3. Wrap bare inline content inside <td>/<th> in <p>. We only do
  //    this when the cell contains no block-level child to begin with
  //    (a heuristic check for "<p", "<ul", "<ol", "<table" is enough).
  out = out.replace(
    /<(td|th)\b([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_full, tag: string, attrs: string, inner: string) => {
      const hasBlock = /<(p|ul|ol|table|div|blockquote|h[1-6])\b/i.test(inner);
      const trimmed = inner.trim();
      if (hasBlock || trimmed === "") return `<${tag}${attrs}>${inner}</${tag}>`;
      return `<${tag}${attrs}><p>${inner}</p></${tag}>`;
    },
  );

  // 4. If a <table> has no <thead> AND the first <tr> uses <td>,
  //    promote those first-row <td>s to <th>. Most external editors
  //    style the first row visually but don't emit semantic <th>.
  out = out.replace(/<table\b[^>]*>([\s\S]*?)<\/table>/gi, (full, inner: string) => {
    if (/<thead\b/i.test(inner)) return full;
    let promoted = false;
    const replaced = inner.replace(/<tr\b([^>]*)>([\s\S]*?)<\/tr>/i, (_trFull, trAttrs: string, trInner: string) => {
      if (promoted) return _trFull;
      promoted = true;
      const headerInner = trInner.replace(/<td\b([^>]*)>([\s\S]*?)<\/td>/gi, "<th$1>$2</th>");
      return `<tr${trAttrs}>${headerInner}</tr>`;
    });
    return full.replace(inner, replaced);
  });

  return out;
}

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
        // H1-H4 covers SEO-friendly outlines (H1 reserved for title in
        // most callers; we still allow it for full editorial freedom).
        heading: { levels: [1, 2, 3, 4] },
      }),
      Link.configure({
        // false = clicks NEVER open the link in the editor; the user can
        // always click to position the cursor. Cmd/Ctrl+click is also
        // intercepted because the editor owns the click handler.
        openOnClick: false,
        autolink: true,
        defaultProtocol: "https",
        protocols: ["http", "https", "mailto"],
        HTMLAttributes: {
          rel: "noopener noreferrer",
          class: "rte-link",
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? "Write something…",
      }),
      // Tables — paste from Google Docs / Notion / Excel renders as
      // a real <table> instead of plain text. resizable:true gives
      // editors drag handles to adjust column widths.
      // We omit a custom HTMLAttributes.class so the generic
      // `.rte-content table` rule styles both inserted AND pasted
      // tables identically (pasted tables never carry our class).
      Table.configure({
        resizable: true,
        handleWidth: 6,
        cellMinWidth: 60,
        lastColumnResizable: true,
        allowTableNodeSelection: true,
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
      // Runs BEFORE TipTap's parser. Cleans pasted HTML so tables
      // from Google Docs / Notion / Word / web comparison pages keep
      // their structure instead of collapsing into paragraphs.
      transformPastedHTML: (html) => transformPastedTablesHtml(html),
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
   * lands as a real paragraph node (not raw text).
   *
   * IMPORTANT: we call `.focus()` WITHOUT a position so TipTap restores
   * the editor's remembered selection (the cursor's last position).
   * The button caller must also `e.preventDefault()` on mousedown so
   * the editor never actually loses its selection to the button.
   * Only if there's no remembered selection do we fall back to "end".
   */
  useImperativeHandle(
    ref,
    () => ({
      insertContent: (incoming: string) => {
        if (!editor) return;
        const hasSelection = !editor.state.selection.empty || editor.state.selection.from > 0;
        editor.chain().focus(hasSelection ? undefined : "end").insertContent(incoming).run();
      },
      focus: () => editor?.commands.focus(),
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
  // Hidden file input that the "Insert image" toolbar button triggers.
  // We do a real upload via /api/admin/upload (same endpoint cover-image
  // upload uses) and insert the returned URL. Replaces the old
  // window.prompt("Image URL") which only let editors paste a remote URL.
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [imgUploading, setImgUploading] = useState(false);
  const [imgError, setImgError] = useState<string | null>(null);

  const onPickImage = useCallback(() => {
    setImgError(null);
    fileInputRef.current?.click();
  }, []);

  const onImageFile = useCallback(
    async (file: File) => {
      setImgError(null);
      setImgUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const json = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
        if (!res.ok || !json.url) {
          throw new Error(json.error ?? `Upload failed (HTTP ${res.status})`);
        }
        editor
          .chain()
          .focus()
          .insertContent(`<p><img src="${json.url}" alt="" /></p>`)
          .run();
      } catch (e) {
        setImgError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setImgUploading(false);
      }
    },
    [editor],
  );

  // Link popover state — replaces the window.prompt with a small inline
  // panel that lets the editor pick rel (nofollow/dofollow/sponsored/ugc)
  // and target_blank alongside the URL.
  const [linkPanel, setLinkPanel] = useState<{
    open: boolean;
    url: string;
    rel: "nofollow" | "dofollow" | "sponsored" | "ugc";
    newTab: boolean;
  }>({ open: false, url: "", rel: "nofollow", newTab: false });

  const openLinkPanel = useCallback(() => {
    const attrs = editor.getAttributes("link") as {
      href?: string;
      rel?: string;
      target?: string;
    };
    const existingRel = attrs.rel ?? "";
    setLinkPanel({
      open: true,
      url: attrs.href ?? "",
      rel: existingRel.includes("sponsored")
        ? "sponsored"
        : existingRel.includes("ugc")
        ? "ugc"
        : existingRel.includes("nofollow")
        ? "nofollow"
        : attrs.href
        ? "dofollow"
        : "nofollow",
      newTab: attrs.target === "_blank",
    });
  }, [editor]);

  const applyLink = useCallback(() => {
    const url = linkPanel.url.trim();
    if (!url) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      setLinkPanel((s) => ({ ...s, open: false }));
      return;
    }
    const safe = /^(https?:\/\/|mailto:)/i.test(url) ? url : `https://${url}`;
    // Compose rel: always include `noopener noreferrer` for security;
    // append the SEO directive (nofollow/sponsored/ugc) — `dofollow`
    // appends nothing because the absence of a directive = default follow.
    const security = "noopener noreferrer";
    const seoRel =
      linkPanel.rel === "nofollow"
        ? `nofollow ${security}`
        : linkPanel.rel === "sponsored"
        ? `sponsored ${security}`
        : linkPanel.rel === "ugc"
        ? `ugc ${security}`
        : security;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({
        href: safe,
        target: linkPanel.newTab ? "_blank" : null,
        rel: seoRel,
      })
      .run();
    setLinkPanel((s) => ({ ...s, open: false }));
  }, [editor, linkPanel]);

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
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <span style={{ fontWeight: 800 }}>H1</span>
      </Btn>
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
      <Btn
        title="Heading 4"
        active={editor.isActive("heading", { level: 4 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
      >
        <span style={{ fontWeight: 800 }}>H4</span>
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
      <Btn title="Insert link" active={editor.isActive("link")} onClick={openLinkPanel}>
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
        title="Horizontal rule (divider)"
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <line x1="3" y1="12" x2="21" y2="12" />
        </svg>
      </Btn>
      <Btn
        title={imgUploading ? "Uploading…" : imgError ? imgError : "Insert image (upload)"}
        onClick={onPickImage}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </Btn>
      {/* Hidden file picker driven by the toolbar button above. */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void onImageFile(file);
        }}
      />
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

      {/* Link panel — slides under the toolbar when "Insert link" is clicked.
          Two-field popover: URL + rel select + "open in new tab" toggle. */}
      {linkPanel.open && (
        <div
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 44,
            left: 12,
            zIndex: 50,
            background: "#fff",
            border: "1px solid var(--border)",
            borderRadius: 10,
            boxShadow: "0 10px 30px rgba(0,0,0,.12)",
            padding: 12,
            width: 360,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ fontFamily: "var(--font-manrope)", fontSize: 12, fontWeight: 800, color: "var(--text)" }}>
            Insert / edit link
          </div>
          <input
            type="url"
            autoFocus
            placeholder="https://example.com"
            value={linkPanel.url}
            onChange={(e) => setLinkPanel((s) => ({ ...s, url: e.target.value }))}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                applyLink();
              } else if (e.key === "Escape") {
                setLinkPanel((s) => ({ ...s, open: false }));
              }
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1.5px solid var(--border)",
              fontSize: 13,
              outline: "none",
            }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, alignItems: "center" }}>
            <select
              value={linkPanel.rel}
              onChange={(e) =>
                setLinkPanel((s) => ({ ...s, rel: e.target.value as typeof s.rel }))
              }
              style={{
                padding: "7px 10px",
                borderRadius: 6,
                border: "1.5px solid var(--border)",
                fontSize: 12.5,
                background: "#fff",
              }}
            >
              <option value="nofollow">rel=nofollow (default)</option>
              <option value="dofollow">rel=dofollow (passes PageRank)</option>
              <option value="sponsored">rel=sponsored (paid/affiliate)</option>
              <option value="ugc">rel=ugc (user-generated)</option>
            </select>
            <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--text-2)" }}>
              <input
                type="checkbox"
                checked={linkPanel.newTab}
                onChange={(e) => setLinkPanel((s) => ({ ...s, newTab: e.target.checked }))}
              />
              New tab
            </label>
          </div>
          <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                editor.chain().focus().extendMarkRange("link").unsetLink().run();
                setLinkPanel((s) => ({ ...s, open: false, url: "" }));
              }}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "#fff",
                color: "var(--red)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Remove
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setLinkPanel((s) => ({ ...s, open: false }))}
              style={{
                padding: "6px 12px",
                fontSize: 12,
                borderRadius: 6,
                border: "1px solid var(--border)",
                background: "#fff",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={applyLink}
              style={{
                padding: "6px 14px",
                fontSize: 12,
                borderRadius: 6,
                border: 0,
                background: "var(--blue)",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
