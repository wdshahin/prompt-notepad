import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const mono = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";
const MAX_DOC_SIZE = 5 * 1024 * 1024; // 5 MB

function getC(theme) {
  if (theme === "light") return {
    bg: "#f7f7f3", surface: "#eeeee9", surface2: "#e5e5e0",
    border: "#d4d4cc", accent: "#5a9e1e", accentFg: "#fff",
    text: "#1c1c1c", muted: "#888884", dim: "#5c5c58", bright: "#222222",
    danger: "#d94040",
    star: "#d97706",
    user: "#0284c7",
    client: "#a21caf",
    trash: "#dc2626",
  };
  return {
    bg: "#0f0f0f", surface: "#141414", surface2: "#1a1a1a",
    border: "#242424", accent: "#c8ff57", accentFg: "#000",
    text: "#e0e0e0", muted: "#555555", dim: "#888888", bright: "#bbbbbb",
    danger: "#ff5555",
    star: "#f5a623",
    user: "#22d3ee",
    client: "#e879f9",
    trash: "#ff6666",
  };
}

// Cache theme colors to avoid recreating identical objects
const COLORS_DARK = getC("dark");
const COLORS_LIGHT = getC("light");
function getCachedC(theme) {
  return theme === "light" ? COLORS_LIGHT : COLORS_DARK;
}

// ─── High-Contrast Vector SVG Icons ────────────────────────────
const IconAll = memo(function IconAll({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <rect x="3" y="3" width="18" height="18" rx="3" ry="3" />
      <line x1="8" y1="8" x2="16" y2="8" />
      <line x1="8" y1="12" x2="16" y2="12" />
      <line x1="8" y1="16" x2="13" y2="16" />
    </svg>
  );
});

const IconStar = memo(function IconStar({ size = 14, color = "currentColor", filled = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? color : "none"} stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
});

const IconUser = memo(function IconUser({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
});

const IconBriefcase = memo(function IconBriefcase({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
});

const IconTrash = memo(function IconTrash({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
});

const IconRestore = memo(function IconRestore({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
});

const IconImage = memo(function IconImage({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
});

const IconPaperclip = memo(function IconPaperclip({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
    </svg>
  );
});

const IconSun = memo(function IconSun({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
});

const IconMoon = memo(function IconMoon({ size = 14, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
});

const IconPlus = memo(function IconPlus({ size = 16, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
});

const IconClose = memo(function IconClose({ size = 12, color = "currentColor" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
});

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function formatDateTime(ts) {
  const d = new Date(ts);
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${day} ${month}, ${hh}:${mm}`;
}

function makeSlug(title, createdAt) {
  const clean = (title || "").trim().replace(/[^a-zA-Z0-9]/g, "").slice(0, 14);
  const d = new Date(createdAt);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${clean || "note"}-${dd}-${mm}-${yyyy}`;
}

// Fast byte estimate using TextEncoder (no Blob allocation)
const _encoder = new TextEncoder();
function estimateBytesFast(str) {
  if (!str) return 0;
  return _encoder.encode(str).byteLength;
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Escape HTML chars
const escapeHtml = s => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function highlightLinks(text, C) {
  const URL_RE = /https?:\/\/[^\s<>"']+/g;
  let result = "";
  let lastIndex = 0;
  let match;
  while ((match = URL_RE.exec(text)) !== null) {
    result += escapeHtml(text.slice(lastIndex, match.index));
    result += `<span style="color:${C.accent};text-decoration:underline;text-underline-offset:3px;text-decoration-color:${C.accent}99">${escapeHtml(match[0])}</span>`;
    lastIndex = URL_RE.lastIndex;
  }
  result += escapeHtml(text.slice(lastIndex));
  return result + "\n";
}

function AuthScreen({ C, theme, toggleTheme }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!supabase) return;
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        const { error: e } = await supabase.auth.signUp({ email, password });
        if (e) throw e;
        setDone(true);
      } else {
        const { error: e } = await supabase.auth.signInWithPassword({ email, password });
        if (e) throw e;
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally { setLoading(false); }
  };

  const inp = { width: "100%", background: C.surface2, border: `1px solid ${C.border}`, borderRadius: 5, padding: "10px 13px", color: C.text, fontFamily: mono, fontSize: 13, outline: "none", boxSizing: "border-box" };

  if (done) return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "40px 36px", width: 340, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 16 }}>📬</div>
        <div style={{ color: C.text, fontSize: 15, fontWeight: 700, marginBottom: 8 }}>Check your email</div>
        <div style={{ color: C.dim, fontSize: 12, lineHeight: 1.7 }}>
          Confirmation link sent to<br />
          <span style={{ color: C.accent }}>{email}</span><br />
          Click it then come back to log in.
        </div>
        <button onClick={() => { setDone(false); setMode("login"); }}
          style={{ marginTop: 20, background: "transparent", border: `1px solid ${C.border}`, color: C.dim, fontFamily: mono, fontSize: 12, padding: "7px 16px", borderRadius: 4, cursor: "pointer" }}>
          Back to login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "40px 36px", width: 340 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ color: C.accent, fontSize: 18, fontWeight: 700, letterSpacing: "0.07em" }}>⌘ PROMPTS</div>
          <button onClick={toggleTheme} title={theme === "dark" ? "Switch to light" : "Switch to dark"}
            style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <IconSun size={14} color={C.dim} /> : <IconMoon size={14} color={C.dim} />}
          </button>
        </div>
        <div style={{ color: C.dim, fontSize: 12, marginBottom: 28 }}>{mode === "login" ? "Sign in to your notepad" : "Create a free account"}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={inp} />
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} style={inp} />
          {error && <div style={{ color: C.danger, fontSize: 11, padding: "7px 10px", background: "#ff000015", borderRadius: 4, border: "1px solid #ff000030" }}>{error}</div>}
          <button onClick={submit} disabled={loading || !email || !password}
            style={{ background: C.accent, color: "#000", border: "none", borderRadius: 5, padding: "10px", fontFamily: mono, fontSize: 13, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, letterSpacing: "0.05em" }}>
            {loading ? "…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>
        <div style={{ marginTop: 20, textAlign: "center", color: C.muted, fontSize: 11 }}>
          {mode === "login" ? "No account? " : "Already have one? "}
          <button onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: C.accent, cursor: "pointer", fontFamily: mono, fontSize: 11, textDecoration: "underline" }}>
            {mode === "login" ? "Sign up free" : "Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Memoized sidebar note row ─────────────────────────────────
const NoteRow = memo(function NoteRow({
  note,
  isActive,
  isTrashMode,
  C,
  onSelect,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
  onToggleTag
}) {
  return (
    <div
      className="note-row"
      onClick={() => onSelect(note.id)}
      style={{
        padding: "11px 14px 8px",
        cursor: "pointer",
        position: "relative",
        borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`,
        background: isActive ? C.surface2 : "transparent",
        opacity: note.deleted && !isTrashMode ? 0.5 : 1,
      }}>
      {/* Title row */}
      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 42 }}>
        {note.title || "Untitled Prompt"}
      </div>

      {/* Tag badges */}
      {!isTrashMode && (note.important || note.personal || note.client) && (
        <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
          {note.important && (
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${C.star}22`, color: C.star, border: `1px solid ${C.star}44`, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
              <IconStar size={10} color={C.star} filled /> important
            </span>
          )}
          {note.personal && (
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${C.user}22`, color: C.user, border: `1px solid ${C.user}44`, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
              <IconUser size={10} color={C.user} /> personal
            </span>
          )}
          {note.client && (
            <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 3, background: `${C.client}22`, color: C.client, border: `1px solid ${C.client}44`, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 600 }}>
              <IconBriefcase size={10} color={C.client} /> client
            </span>
          )}
        </div>
      )}

      <div style={{ color: C.bright, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{timeAgo(note.updatedAt)}</div>
      <div style={{ color: C.dim, fontSize: 11, display: "flex", alignItems: "center", gap: 8 }}>
        <span>{formatDateTime(note.updatedAt)}</span>
        {note.images?.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C.dim }}>
            <IconImage size={11} color={C.dim} /> {note.images.length}
          </span>
        )}
        {note.files?.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C.dim }}>
            <IconPaperclip size={11} color={C.dim} /> {note.files.length}
          </span>
        )}
      </div>

      {/* Action buttons */}
      {isTrashMode ? (
        <div style={{ position: "absolute", top: 8, right: 6, display: "flex", gap: 4 }}>
          <button
            onClick={e => { e.stopPropagation(); onRestore(note.id); }}
            title="Restore prompt"
            style={{
              background: `${C.accent}22`, border: `1px solid ${C.accent}66`, color: C.accent,
              width: 22, height: 22, borderRadius: 4, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <IconRestore size={11} color={C.accent} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); onPermanentDelete(note.id); }}
            title="Delete permanently"
            className="note-delete-btn"
            style={{
              background: "#ff444422", border: "1px solid #ff444455", color: C.trash,
              width: 22, height: 22, borderRadius: 4, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
            <IconTrash size={11} color={C.trash} />
          </button>
        </div>
      ) : (
        <button
          onClick={e => { e.stopPropagation(); onMoveToTrash(note.id); }}
          title="Move to trash"
          className="note-delete-btn"
          style={{
            position: "absolute", top: 10, right: 6,
            background: "#ff444415", border: "1px solid #ff444440", color: C.trash,
            width: 22, height: 22, borderRadius: "50%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
          <IconClose size={10} color={C.trash} />
        </button>
      )}

      {/* Hover tag strip (active notes only) */}
      {!isTrashMode && (
        <div className="tag-bar" style={{ display: "flex", gap: 4, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
          {[
            { tag: "important", label: "important", col: C.star, Icon: IconStar },
            { tag: "personal", label: "personal", col: C.user, Icon: IconUser },
            { tag: "client", label: "client", col: C.client, Icon: IconBriefcase }
          ].map(({ tag, col, Icon }) => (
            <button key={tag}
              onClick={e => { e.stopPropagation(); onToggleTag(note.id, tag); }}
              title={`Mark as ${tag}`}
              className="tag-toggle-btn"
              style={{
                flex: 1, padding: "4px 0", borderRadius: 4, cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: note[tag] ? `${col}33` : "transparent",
                border: `1px solid ${note[tag] ? col : C.border}`,
              }}>
              <Icon size={12} color={note[tag] ? col : C.dim} filled={note[tag] && tag === "important"} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ─── Memoized link-highlighted backdrop ────────────────────────
const EditorBackdrop = memo(function EditorBackdrop({ text, C, backdropRef }) {
  const html = useMemo(() => highlightLinks(text, C), [text, C]);
  return (
    <div
      ref={backdropRef}
      aria-hidden="true"
      className="editor-backdrop"
      style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        padding: "22px", fontFamily: mono, fontSize: 15, lineHeight: 1.85,
        color: C.text, whiteSpace: "pre-wrap", wordBreak: "break-word",
        overflowY: "hidden", pointerEvents: "none", zIndex: 0,
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
});

// ─── Editor Area Component (keyed per note ID) ──────────────────
function EditorArea({
  note,
  C,
  theme,
  mono,
  toggleTheme,
  onUpdateNote,
  onRestore,
  onPermanentDelete,
  openCarousel,
  showToast,
  fileInputRef,
  docInputRef,
  toolBtnStyle,
  removeImage,
  removeFile,
}) {
  const [localText, setLocalText] = useState(note.text || "");
  const [localTitle, setLocalTitle] = useState(note.title || "");
  
  // Custom title detection: true if title is already custom (not default and not matching first line)
  const [isCustomTitle, setIsCustomTitle] = useState(() => {
    if (!note.title || note.title === "Untitled Prompt") return false;
    const firstLine = (note.text || "").trim().split("\n")[0].slice(0, 50);
    return note.title !== firstLine;
  });

  const editorRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!note.text && editorRef.current) {
      editorRef.current.focus();
    }
  }, [note.id, note.text]);

  const handleTitleChange = useCallback((e) => {
    const val = e.target.value;
    setLocalTitle(val);
    if (!val.trim()) {
      setIsCustomTitle(false);
      const firstLine = localText.trim().split("\n")[0].slice(0, 50);
      onUpdateNote(note.id, { title: firstLine || "Untitled Prompt" });
    } else {
      setIsCustomTitle(true);
      onUpdateNote(note.id, { title: val });
    }
  }, [localText, note.id, onUpdateNote]);

  const handleTextChange = useCallback((e) => {
    const text = e.target.value;
    setLocalText(text);

    if (!isCustomTitle) {
      const firstLine = text.trim().split("\n")[0].slice(0, 50);
      const newTitle = firstLine || "Untitled Prompt";
      setLocalTitle(newTitle);
      onUpdateNote(note.id, { text, title: newTitle });
    } else {
      // Locked custom title: do not overwrite title when user types in the body!
      onUpdateNote(note.id, { text });
    }
  }, [isCustomTitle, note.id, onUpdateNote]);

  const syncBackdropScroll = useCallback((e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
      backdropRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  const handleLinkClick = useCallback((e) => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const textarea = editorRef.current;
    if (!textarea) return;
    const pos = textarea.selectionStart;
    const text = localText;
    const URL_RE = /https?:\/\/[^\s<>"']+/g;
    let match;
    while ((match = URL_RE.exec(text)) !== null) {
      if (pos >= match.index && pos <= match.index + match[0].length) {
        e.preventDefault();
        window.open(match[0], "_blank", "noopener,noreferrer");
        return;
      }
    }
  }, [localText]);

  const copyText = useCallback(() => {
    if (!localText) return;
    navigator.clipboard.writeText(localText)
      .then(() => showToast("Copied ✓", "success"))
      .catch(() => showToast("Copy failed", "error"));
  }, [localText, showToast]);

  const downloadTxt = useCallback(() => {
    const blob = new Blob([localText], { type: "text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${(localTitle || "prompt").replace(/[^a-z0-9]/gi, "_")}.txt`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Downloaded .txt ✓", "success");
  }, [localText, localTitle, showToast]);

  const downloadDoc = useCallback(() => {
    const lines = localText.split("\n")
      .map(l => `<p style="font-family:Calibri,sans-serif;font-size:12pt;margin:0 0 6pt">${escapeHtml(l) || "&nbsp;"}</p>`)
      .join("");
    const imgs = (note.images || []).map((img, i) =>
      `<p style="margin:12pt 0 4pt;font-family:Calibri;font-size:9pt;color:#888">Image ${i + 1}</p>` +
      `<p><img src="${img.dataUrl}" style="max-width:6.5in;width:100%;border:1pt solid #ddd"/></p>`
    ).join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"/>
<style>
  @page { size: 8.5in 11in; margin: 1in; mso-header-margin: .5in; mso-footer-margin: .5in; mso-paper-source: 0; }
  body { font-family: Calibri, sans-serif; font-size: 12pt; margin: 1in; }
  p { margin: 0 0 6pt; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
<h1 style="font-family:Calibri;font-size:16pt;margin:0 0 14pt;color:#111">${escapeHtml(localTitle || "Untitled Prompt")}</h1>
${lines}
${imgs ? `<p style="margin:18pt 0 6pt;font-family:Calibri;font-size:11pt;font-weight:bold;color:#444;border-top:1pt solid #ddd;padding-top:10pt">Attached Images</p>${imgs}` : ""}
</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const a = Object.assign(document.createElement("a"), {
      href: URL.createObjectURL(blob),
      download: `${(localTitle || "prompt").replace(/[^a-z0-9]/gi, "_")}.doc`
    });
    a.click();
    URL.revokeObjectURL(a.href);
    showToast("Downloaded .doc ✓", "success");
  }, [localText, localTitle, note.images, showToast]);

  const isTrashed = !!note.deleted;

  return (
    <>
      {isTrashed && (
        <div style={{
          background: `${C.star}15`,
          borderBottom: `1px solid ${C.star}44`,
          padding: "10px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexShrink: 0,
          flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.star, fontSize: 13, fontWeight: 600 }}>
            <IconTrash size={16} color={C.star} />
            <span>This prompt is in the Trash.</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => onRestore(note.id)}
              style={{ background: C.accent, color: C.accentFg, border: "none", borderRadius: 4, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: mono, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconRestore size={12} color={C.accentFg} /> Restore
            </button>
            <button
              onClick={() => onPermanentDelete(note.id)}
              style={{ background: "#ff444422", border: "1px solid #ff444455", color: C.trash, borderRadius: 4, padding: "5px 14px", fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: mono, display: "inline-flex", alignItems: "center", gap: 5 }}>
              <IconTrash size={12} color={C.trash} /> Delete Forever
            </button>
          </div>
        </div>
      )}

      <div className="editor-toolbar" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
        <input
          value={localTitle}
          onChange={handleTitleChange}
          placeholder="Prompt title…"
          disabled={isTrashed}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: mono, fontSize: 15, fontWeight: 700, minWidth: 0, opacity: isTrashed ? 0.6 : 1 }}
        />
        <div className="editor-tools" style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
          <button onClick={copyText} className="tool-btn" style={toolBtnStyle}>Copy</button>
          <button onClick={downloadTxt} className="tool-btn" style={toolBtnStyle}>↓ .txt</button>
          <button onClick={downloadDoc} className="tool-btn" style={toolBtnStyle}>↓ .doc</button>
          {!isTrashed && (
            <>
              <button onClick={() => fileInputRef.current?.click()} className="tool-btn" style={{ ...toolBtnStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <IconImage size={12} color={C.dim} /> Image
              </button>
              <button onClick={() => docInputRef.current?.click()} className="tool-btn" style={{ ...toolBtnStyle, display: "inline-flex", alignItems: "center", gap: 4 }}>
                <IconPaperclip size={12} color={C.dim} /> File
              </button>
            </>
          )}
          <button onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}
            style={{ ...toolBtnStyle, padding: "5px 8px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <IconSun size={14} color={C.dim} /> : <IconMoon size={14} color={C.dim} />}
          </button>
        </div>
      </div>

      <div className="editor-body">
        <div className="editor-text-wrap">
          <EditorBackdrop text={localText} C={C} backdropRef={backdropRef} />
          <textarea
            ref={editorRef}
            value={localText}
            onChange={handleTextChange}
            onClick={handleLinkClick}
            onScroll={syncBackdropScroll}
            placeholder={isTrashed ? "This prompt is in trash." : "Write your prompt here…\n\nPaste image: Ctrl+V / Cmd+V\nOr click 'Image' to attach from file"}
            spellCheck={false}
            readOnly={isTrashed}
            style={{
              position: "relative", zIndex: 1,
              width: "100%", height: "100%",
              background: "transparent", border: "none", outline: "none", resize: "none",
              color: "transparent", caretColor: isTrashed ? "transparent" : C.text,
              fontFamily: mono, fontSize: 15, lineHeight: 1.85, padding: "22px",
            }}
          />
        </div>

        {note.images?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 22px 14px" }}>
            {note.images.map((img, idx) => (
              <div key={img.id} style={{ position: "relative", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden", lineHeight: 0 }}>
                <img
                  src={img.dataUrl}
                  onClick={() => openCarousel(note.images, idx)}
                  className="img-thumb"
                  style={{ maxWidth: 320, maxHeight: 240, display: "block", objectFit: "contain", background: "#111", cursor: "zoom-in" }}
                  alt=""
                />
                {!isTrashed && (
                  <button
                    onClick={() => removeImage(note.id, img.id)}
                    style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.75)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <IconClose size={12} color="#fff" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {note.files?.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: "0 22px 14px" }}>
            <div style={{ color: C.dim, fontSize: 11, marginBottom: 2, letterSpacing: "0.05em", textTransform: "uppercase" }}>Attachments</div>
            {note.files.map(f => {
              return (
                <div key={f.id} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: "8px 12px",
                }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <IconPaperclip size={18} color={C.accent} />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: C.text, fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{f.name}</div>
                    <div style={{ color: C.dim, fontSize: 11 }}>{formatSize(f.size)}</div>
                  </div>
                  <a href={f.dataUrl} download={f.name}
                    style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, padding: "4px 10px", fontSize: 11, fontFamily: mono, textDecoration: "none", cursor: "pointer", flexShrink: 0 }}
                    title={`Download ${f.name}`}
                  >↓ Download</a>
                  {!isTrashed && (
                    <button onClick={() => removeFile(note.id, f.id)}
                      style={{ background: "#ff444422", border: "1px solid #ff444455", color: C.trash, width: 22, height: 22, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                      title="Remove attachment">
                      <IconClose size={11} color={C.trash} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div style={{ padding: "8px 22px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
          <span>{isTrashed ? "Trash mode · Read-only" : "Ctrl+Click links · Ctrl+V paste image · File attaches .md/.csv/.pdf"}</span>
          <span>{localText.length} chars</span>
        </div>
      </div>
    </>
  );
}

const RAIL = [
  { id: null, label: "All", Icon: IconAll, colorKey: "accent" },
  { id: "important", label: "Important", Icon: IconStar, colorKey: "star" },
  { id: "personal", label: "Personal", Icon: IconUser, colorKey: "user" },
  { id: "client", label: "Client", Icon: IconBriefcase, colorKey: "client" },
  { id: "trash", label: "Trash", Icon: IconTrash, colorKey: "trash" },
];

export default function PromptNotepad() {
  const [theme, setTheme] = useState(() => localStorage.getItem("pn-theme") || "dark");
  const C = getCachedC(theme);
  const toggleTheme = useCallback(() => setTheme(t => { const n = t === "dark" ? "light" : "dark"; localStorage.setItem("pn-theme", n); return n; }), []);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(!supabase);
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(() => {
    const hash = window.location.hash;
    return hash ? hash.slice(1) : null;
  });
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterTag, setFilterTag] = useState(null);
  const [fetchError, setFetchError] = useState(null);
  const [carousel, setCarousel] = useState(null); // {images:[], index:0}
  const [mobOpen, setMobOpen] = useState(false);

  const saveTimer = useRef(null);
  const pendingNotesRef = useRef({});
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  const toastTimer = useRef(null);

  const activeNote = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);

  const trashedNotes = useMemo(() => notes.filter(n => n.deleted), [notes]);
  const activeNotes = useMemo(() => notes.filter(n => !n.deleted), [notes]);

  const filteredNotes = useMemo(() => {
    if (filterTag === "trash") return trashedNotes;
    if (filterTag) return activeNotes.filter(n => n[filterTag]);
    return activeNotes;
  }, [activeNotes, trashedNotes, filterTag]);

  const openCarousel = useCallback((images, index) => setCarousel({ images, index }), []);
  const closeCarousel = useCallback(() => setCarousel(null), []);
  const carouselPrev = useCallback(() => setCarousel(c => ({ ...c, index: (c.index - 1 + c.images.length) % c.images.length })), []);
  const carouselNext = useCallback(() => setCarousel(c => ({ ...c, index: (c.index + 1) % c.images.length })), []);

  // Keyboard navigation for image carousel
  useEffect(() => {
    if (!carousel) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeCarousel();
      if (e.key === "ArrowLeft") carouselPrev();
      if (e.key === "ArrowRight") carouselNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [carousel, closeCarousel, carouselPrev, carouselNext]);

  useEffect(() => { document.body.style.background = C.bg; }, [C.bg]);

  useEffect(() => {
    if (activeId) {
      const active = notes.find(n => n.id === activeId);
      if (active) {
        const slug = makeSlug(active.title, active.createdAt);
        if (window.location.hash !== `#${slug}`) {
          window.history.replaceState(null, "", `#${slug}`);
        }
      }
    } else {
      if (window.location.hash !== "") {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    }
  }, [activeId, notes]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decoded = decodeURIComponent(hash);
        const match = notes.find(n => {
          if (n.id === hash) return true;
          const noteSlug = makeSlug(n.title, n.createdAt);
          return noteSlug === decoded;
        });
        if (match) {
          setActiveId(match.id);
        }
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [notes]);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchNotes = useCallback(async () => {
    if (!supabase) return;
    try {
      const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(row => ({
        id: row.id, title: row.title, text: row.text,
        images: row.images || [],
        files: row.files || [],
        important: row.important || false, personal: row.personal || false, client: row.client || false,
        deleted: row.deleted || false,
        createdAt: new Date(row.created_at).getTime(),
        updatedAt: new Date(row.updated_at).getTime(),
      }));
      setNotes(mapped);

      const urlHash = window.location.hash.slice(1);

      const findNoteByHash = (hash, list) => {
        if (!hash) return null;
        const decoded = decodeURIComponent(hash);
        // 1. Try exact ID match
        const matchById = list.find(n => n.id === hash);
        if (matchById) return matchById;
        // 2. Try slug match (title-14chars-DD-MM-YYYY)
        const matchBySlug = list.find(n => {
          const noteSlug = makeSlug(n.title, n.createdAt);
          return noteSlug === decoded;
        });
        return matchBySlug || null;
      };

      const matchedNote = findNoteByHash(urlHash, mapped);
      if (matchedNote) {
        setActiveId(matchedNote.id);
      } else {
        const firstActive = mapped.find(n => !n.deleted);
        if (firstActive) {
          setActiveId(firstActive.id);
        } else if (mapped.length > 0) {
          setActiveId(mapped[0].id);
        }
      }

      setFetchError(null);
    } catch (e) {
      console.error(e);
      setFetchError(e.message || "Failed to fetch notes");
    } finally {
      setLoaded(true);
    }
  }, []);

  const userId = user?.id;
  useEffect(() => {
    if (!userId) {
      setTimeout(() => {
        setNotes([]);
        setLoaded(false);
      }, 0);
      return;
    }
    setTimeout(() => {
      fetchNotes();
    }, 0);
  }, [userId, fetchNotes]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const saveImmediately = useCallback(async (note) => {
    if (!user || !supabase) return;
    try {
      const { error } = await supabase.from("notes").upsert({
        id: note.id, user_id: user.id, title: note.title, text: note.text,
        images: note.images,
        files: note.files || [],
        important: note.important || false, personal: note.personal || false, client: note.client || false,
        deleted: note.deleted || false,
        updated_at: new Date().toISOString(),
      });
      if (error) throw error;
      setSaving(false);
    } catch (error) {
      console.error("Save error:", error);
      if (error.message && error.message.includes("deleted")) {
        showToast("Run the SQL migration in Supabase to add the 'deleted' column for Trash", "error");
      } else {
        showToast(error.message ? `Sync failed: ${error.message}` : "Sync failed — check connection", "error");
      }
      setSaving(false);
    }
  }, [user, showToast]);

  const debouncedSave = useCallback((note) => {
    pendingNotesRef.current[note.id] = note;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const pending = pendingNotesRef.current[note.id];
      if (pending) {
        delete pendingNotesRef.current[note.id];
        await saveImmediately(pending);
      }
    }, 800);
  }, [saveImmediately]);

  // Flush any pending save before tab close or refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      const ids = Object.keys(pendingNotesRef.current);
      for (const id of ids) {
        saveImmediately(pendingNotesRef.current[id]);
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveImmediately]);

  const updateNote = useCallback((id, patch) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, ...patch, updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const createNote = useCallback(async () => {
    if (!user || !supabase) return;
    if (filterTag === "trash") setFilterTag(null);
    const note = {
      id: generateId(),
      title: "Untitled Prompt",
      text: "",
      images: [],
      files: [],
      important: false,
      personal: false,
      client: false,
      deleted: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    const { error } = await supabase.from("notes").insert({
      id: note.id, user_id: user.id, title: note.title, text: note.text, images: note.images, files: note.files,
      important: false, personal: false, client: false, deleted: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error(error);
      showToast(error.message || "Failed to create prompt", "error");
      return;
    }
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    setMobOpen(false);
  }, [user, filterTag, showToast]);

  // Trash Bin Operations
  const moveToTrash = useCallback((id) => {
    updateNote(id, { deleted: true });
    showToast("Moved to trash 🗑", "warn");
    if (activeId === id) {
      const remainingActive = activeNotes.filter(n => n.id !== id);
      setActiveId(remainingActive[0]?.id || null);
    }
  }, [updateNote, showToast, activeId, activeNotes]);

  const restoreNote = useCallback((id) => {
    updateNote(id, { deleted: false });
    showToast("Prompt restored ✓", "success");
  }, [updateNote, showToast]);

  const permanentDeleteNote = useCallback(async (id) => {
    if (!supabase) return;
    if (!window.confirm("Permanently delete this prompt? This cannot be undone.")) return;
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) {
      console.error("Delete error:", error);
      showToast(error.message || "Failed to delete", "error");
      return;
    }
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (activeId === id) {
        const remaining = filterTag === "trash" ? updated.filter(n => n.deleted) : updated.filter(n => !n.deleted);
        setActiveId(remaining[0]?.id || null);
      }
      return updated;
    });
    showToast("Permanently deleted", "success");
  }, [activeId, filterTag, showToast]);

  const emptyTrash = useCallback(async () => {
    if (!supabase || trashedNotes.length === 0) return;
    if (!window.confirm(`Permanently delete all ${trashedNotes.length} prompt(s) in trash? This cannot be undone.`)) return;
    const ids = trashedNotes.map(n => n.id);
    const { error } = await supabase.from("notes").delete().in("id", ids);
    if (error) {
      console.error("Empty trash error:", error);
      showToast(error.message || "Failed to empty trash", "error");
      return;
    }
    setNotes(prev => prev.filter(n => !n.deleted));
    if (trashedNotes.some(n => n.id === activeId)) {
      setActiveId(null);
    }
    showToast("Trash emptied", "success");
  }, [trashedNotes, activeId, showToast]);

  const toggleTag = useCallback((id, tag) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, [tag]: !n[tag], updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const addImageToNote = useCallback((id, dataUrl) => {
    const img = { id: generateId(), dataUrl };
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, images: [...(n.images || []), img], updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
    showToast("Image attached ✓", "success");
  }, [debouncedSave, showToast]);

  const addFileToNote = useCallback((id, fileObj) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, files: [...(n.files || []), fileObj], updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const removeFile = useCallback((noteId, fileId) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      const merged = { ...n, files: n.files.filter(f => f.id !== fileId), updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const handleDocFileUpload = useCallback((e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file || !activeId) return;

    if (file.size > MAX_DOC_SIZE) {
      showToast("File too large — max 5 MB", "error");
      return;
    }

    const name = file.name;
    const ext = name.split(".").pop().toLowerCase();
    const allowed = ["md", "csv", "pdf"];
    if (!allowed.includes(ext)) {
      showToast("Unsupported type — use .md, .csv or .pdf", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const fileObj = {
        id: generateId(),
        name,
        type: ext,
        size: file.size,
        dataUrl: ev.target.result,
      };
      addFileToNote(activeId, fileObj);
      showToast(`${name} attached ✓`, "success");
    };
    reader.onerror = () => showToast(`Failed to read ${name}`, "error");
    reader.readAsDataURL(file);
  }, [activeId, addFileToNote, showToast]);

  const handleFileInputWithToast = useCallback((e) => {
    const file = e.target.files[0];
    if (!file || !activeId) return;
    if (!file.type.startsWith("image/")) { showToast("Only image files allowed", "error"); return; }
    const reader = new FileReader();
    reader.onload = ev => addImageToNote(activeId, ev.target.result);
    reader.onerror = () => showToast("Failed to read image file", "error");
    reader.readAsDataURL(file);
    e.target.value = "";
  }, [activeId, addImageToNote, showToast]);

  const removeImage = useCallback((noteId, imgId) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      const merged = { ...n, images: n.images.filter(i => i.id !== imgId), updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const handlePaste = useCallback((e) => {
    if (!activeId || activeNote?.deleted) return;
    for (const item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = ev => addImageToNote(activeId, ev.target.result);
        reader.readAsDataURL(item.getAsFile());
        return;
      }
    }
  }, [activeId, activeNote?.deleted, addImageToNote]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setNotes([]);
    setActiveId(null);
    setLoaded(false);
  }, []);

  // Storage usage calculation
  const STORAGE_LIMIT = 500 * 1024 * 1024; // 500 MB
  const storageUsed = useMemo(() => {
    return notes.reduce((acc, n) => {
      let size = estimateBytesFast(n.title) + estimateBytesFast(n.text);
      (n.images || []).forEach(img => { size += estimateBytesFast(img.dataUrl || ""); });
      (n.files || []).forEach(f => { size += f.size || 0; });
      return acc + size;
    }, 0);
  }, [notes]);
  const storagePercent = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100);
  const storageColor = storagePercent > 90 ? C.danger : storagePercent > 70 ? C.star : C.accent;

  const handleNoteSelect = useCallback((id) => {
    setActiveId(id);
    setMobOpen(false);
  }, []);

  if (!supabase) {
    return (
      <div style={{ background: C.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 20 }}>
        <div style={{ color: C.accent, fontSize: 22, fontWeight: 700, marginBottom: 12 }}>⌘ PROMPTS</div>
        <div style={{ color: C.danger, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Configuration Needed</div>
        <div style={{ color: C.text, fontSize: 13, textAlign: "center", maxWidth: 420, lineHeight: 1.6, marginBottom: 20 }}>
          Supabase environment variables are missing. Please add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to your <code>.env</code> file.
        </div>
      </div>
    );
  }

  if (!authChecked) return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, color: C.muted, gap: 10 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />Connecting…
    </div>
  );

  if (!user) return <AuthScreen C={C} theme={theme} toggleTheme={toggleTheme} />;

  if (!loaded) return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: mono, color: C.muted, gap: 10 }}>
      <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.accent }} />Loading notes…
    </div>
  );

  if (fetchError) return (
    <div style={{ background: C.bg, height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: mono, padding: 20 }}>
      <div style={{ color: C.danger, fontSize: 18, fontWeight: 700, marginBottom: 12 }}>⚠️ Connection Error</div>
      <div style={{ color: C.text, fontSize: 13, textAlign: "center", maxWidth: 400, lineHeight: 1.6, marginBottom: 24 }}>{fetchError}</div>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, padding: 16, borderRadius: 8, fontSize: 11, color: C.dim }}>
        <b>Pro tip:</b> If it says "column does not exist", make sure you ran the SQL migration in <code>schema.sql</code> in your Supabase dashboard.
      </div>
      <button onClick={() => window.location.reload()} style={{ marginTop: 24, background: C.accent, color: C.accentFg, border: "none", padding: "10px 20px", borderRadius: 5, cursor: "pointer", fontWeight: 700 }}>Retry</button>
    </div>
  );

  const toolBtnStyle = { background: "transparent", border: `1px solid ${C.border}`, color: C.dim, fontFamily: mono, fontSize: 12, padding: "5px 11px", borderRadius: 4, cursor: "pointer" };

  const toastBg = toast?.type === 'error' ? '#c0392b' : toast?.type === 'warn' ? '#e67e22' : C.accent;
  const toastFg = toast?.type === 'error' || toast?.type === 'warn' ? '#fff' : C.accentFg;

  return (
    <div className="app-root" style={{ background: C.bg, fontFamily: mono }} onPaste={handlePaste}>

      {/* Carousel */}
      {carousel && (
        <div className="carousel-backdrop" onClick={closeCarousel}>
          <img src={carousel.images[carousel.index].dataUrl} className="carousel-img" alt="" onClick={e => e.stopPropagation()} />
          {carousel.images.length > 1 && (
            <>
              <button className="carousel-btn carousel-btn-prev" onClick={e => { e.stopPropagation(); carouselPrev(); }} aria-label="Previous">‹</button>
              <button className="carousel-btn carousel-btn-next" onClick={e => { e.stopPropagation(); carouselNext(); }} aria-label="Next">›</button>
              <div className="carousel-dots" onClick={e => e.stopPropagation()}>
                {carousel.images.map((_, i) => (
                  <button key={i} className={`carousel-dot${i === carousel.index ? ' active' : ''}`} onClick={() => setCarousel(c => ({ ...c, index: i }))} />
                ))}
              </div>
              <div className="carousel-counter">{carousel.index + 1} / {carousel.images.length}</div>
            </>
          )}
          <button className="carousel-close" onClick={closeCarousel}>&times;</button>
        </div>
      )}

      {toast && (
        <div className="toast" style={{ background: toastBg, color: toastFg }}>
          {toast.type === 'error' ? '⚠️' : toast.type === 'warn' ? '⚡' : '✓'} {toast.msg}
        </div>
      )}

      {mobOpen && <div className="mob-overlay" onClick={() => setMobOpen(false)} />}

      <div className="app-frame" style={{ border: `1px solid ${C.border}`, boxShadow: "0 0 80px rgba(0,0,0,0.55)" }}>

        {/* Mobile header */}
        <div className="mob-header" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
          <button className="mob-hamburger" onClick={() => setMobOpen(o => !o)}>
            <span style={{ background: C.text }} /><span style={{ background: C.text }} /><span style={{ background: C.text }} />
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            {filterTag === "trash" ? (
              <IconTrash size={16} color={C.trash} />
            ) : (
              <span style={{ color: C.accent, fontSize: 16, fontWeight: 700 }}>⌘</span>
            )}
            <span style={{ color: filterTag === "trash" ? C.trash : C.accent, fontSize: 14, fontWeight: 700, letterSpacing: "0.07em" }}>
              {filterTag === "trash" ? "TRASH" : "PROMPTS"}
            </span>
          </div>
          <button onClick={toggleTheme} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 30, height: 30, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? <IconSun size={14} color={C.dim} /> : <IconMoon size={14} color={C.dim} />}
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`sidebar${mobOpen ? ' mob-open' : ''}`} style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
            {/* Row 1: title + new button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="sidebar-close-btn" onClick={() => setMobOpen(false)}
                  style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 26, height: 26, cursor: "pointer", display: "none", alignItems: "center", justifyContent: "center" }}>
                  <IconClose size={14} color={C.dim} />
                </button>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {filterTag === "trash" ? (
                    <IconTrash size={16} color={C.trash} />
                  ) : (
                    <span style={{ color: C.accent, fontSize: 16, fontWeight: 700 }}>⌘</span>
                  )}
                  <span style={{ color: filterTag === "trash" ? C.trash : C.accent, fontSize: 14, fontWeight: 700, letterSpacing: "0.07em" }}>
                    {filterTag === "trash" ? "TRASH" : "PROMPTS"}
                  </span>
                </div>
              </div>
              <button onClick={createNote} title="New prompt" style={{ background: C.accent, color: C.accentFg, border: "none", borderRadius: 4, width: 26, height: 26, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconPlus size={16} color={C.accentFg} />
              </button>
            </div>

            {/* Row 2: filter buttons including Trash with high-contrast vector icons */}
            <div style={{ display: "flex", gap: 4, padding: "0 14px 10px" }}>
              {RAIL.map(r => {
                const isSelected = filterTag === r.id;
                const isTrash = r.id === "trash";
                const itemColor = C[r.colorKey] || C.accent;
                return (
                  <button
                    key={String(r.id)}
                    onClick={() => {
                      const nextFilter = filterTag === r.id ? null : r.id;
                      setFilterTag(nextFilter);
                      const targetList = nextFilter === "trash"
                        ? trashedNotes
                        : nextFilter
                          ? activeNotes.filter(n => n[nextFilter])
                          : activeNotes;
                      if (!targetList.some(n => n.id === activeId)) {
                        setActiveId(targetList[0]?.id || null);
                      }
                    }}
                    title={isTrash ? `Trash (${trashedNotes.length})` : r.label}
                    style={{
                      flex: 1,
                      background: isSelected ? `${itemColor}22` : "transparent",
                      border: `1px solid ${isSelected ? itemColor : C.border}`,
                      borderRadius: 4,
                      height: 28,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      position: "relative",
                      transition: "border-color 0.15s, background-color 0.15s",
                    }}>
                    <r.Icon
                      size={14}
                      color={isSelected ? itemColor : (r.id ? `${itemColor}cc` : C.dim)}
                      filled={isSelected && r.id === "important"}
                    />
                    {isTrash && trashedNotes.length > 0 && (
                      <span style={{
                        position: "absolute", top: -3, right: -3,
                        background: C.trash, color: "#fff",
                        fontSize: 8, fontWeight: 700, borderRadius: "50%",
                        width: 13, height: 13, display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        {trashedNotes.length > 9 ? "9+" : trashedNotes.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sidebar-list">
            {filterTag === "trash" && trashedNotes.length > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
                <span style={{ fontSize: 11, color: C.dim }}>{trashedNotes.length} in trash</span>
                <button
                  onClick={emptyTrash}
                  style={{ background: "#ff444422", border: "1px solid #ff444455", color: C.trash, fontSize: 10, padding: "3px 8px", borderRadius: 4, cursor: "pointer", fontFamily: mono, fontWeight: 600 }}>
                  Empty Trash
                </button>
              </div>
            )}
            {filteredNotes.length === 0 && (
              <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "32px 14px", lineHeight: 1.8 }}>
                {filterTag === "trash" ? "Trash is empty." : filterTag ? `No ${filterTag} prompts.` : "No prompts yet."}
                <br />
                {filterTag ? "" : "Hit + to start."}
              </div>
            )}
            {filteredNotes.map(n => (
              <NoteRow
                key={n.id}
                note={n}
                isActive={n.id === activeId}
                isTrashMode={filterTag === "trash" || !!n.deleted}
                C={C}
                onSelect={handleNoteSelect}
                onMoveToTrash={moveToTrash}
                onRestore={restoreNote}
                onPermanentDelete={permanentDeleteNote}
                onToggleTag={toggleTag}
              />
            ))}
          </div>

          <div className="sidebar-footer" style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: saving ? C.star : C.accent, flexShrink: 0 }} />
              <span style={{ color: C.muted, fontSize: 11 }}>{saving ? "Saving…" : "Synced ✓"}</span>
            </div>
            {/* Storage usage bar */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <span style={{ color: C.dim, fontSize: 10 }}>Storage</span>
                <span style={{ color: storageColor, fontSize: 10, fontWeight: 600 }}>{formatSize(storageUsed)} / 500 MB</span>
              </div>
              <div style={{ height: 4, background: C.surface2, borderRadius: 2, overflow: "hidden" }}>
                <div className="storage-bar-fill" style={{ height: "100%", width: `${storagePercent}%`, background: storageColor, borderRadius: 2 }} />
              </div>
              {storagePercent > 90 && <div style={{ color: C.danger, fontSize: 9, marginTop: 3 }}>⚠ Storage almost full</div>}
            </div>
            <div style={{ color: C.muted, fontSize: 10, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.email}</div>
            <button onClick={signOut} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.muted, fontFamily: mono, fontSize: 10, padding: "4px 10px", borderRadius: 4, cursor: "pointer", width: "100%" }}>Sign out</button>
          </div>
        </aside>

        {/* Editor Area */}
        <main className="editor-main" style={{ background: C.bg }}>
          {!activeNote ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ opacity: 0.2, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {filterTag === "trash" ? <IconTrash size={52} color={C.muted} /> : <IconAll size={52} color={C.muted} />}
              </div>
              <div style={{ color: C.muted, fontSize: 15 }}>
                {filterTag === "trash"
                  ? (trashedNotes.length === 0 ? "Trash is empty" : "Select a trashed prompt to view or restore")
                  : "Create a new prompt to get started"}
              </div>
              {filterTag !== "trash" && (
                <button onClick={createNote} style={{ background: C.accent, color: "#000", border: "none", borderRadius: 5, padding: "10px 24px", fontFamily: mono, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>+ NEW PROMPT</button>
              )}
            </div>
          ) : (
            <EditorArea
              key={activeNote.id}
              note={activeNote}
              C={C}
              theme={theme}
              mono={mono}
              toggleTheme={toggleTheme}
              onUpdateNote={updateNote}
              onRestore={restoreNote}
              onPermanentDelete={permanentDeleteNote}
              openCarousel={openCarousel}
              showToast={showToast}
              fileInputRef={fileInputRef}
              docInputRef={docInputRef}
              toolBtnStyle={toolBtnStyle}
              removeImage={removeImage}
              removeFile={removeFile}
            />
          )}
        </main>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInputWithToast} />
      <input ref={docInputRef} type="file" accept=".md,.csv,.pdf" style={{ display: "none" }} onChange={handleDocFileUpload} />
    </div>
  );
}
