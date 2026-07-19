import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const mono = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";

function getC(theme) {
  if (theme === "light") return {
    bg: "#f7f7f3", surface: "#eeeee9", surface2: "#e5e5e0",
    border: "#d4d4cc", accent: "#5a9e1e", accentFg: "#fff",
    text: "#1c1c1c", muted: "#aaa", dim: "#777", bright: "#444",
    danger: "#d94040",
  };
  return {
    bg: "#0f0f0f", surface: "#141414", surface2: "#1a1a1a",
    border: "#242424", accent: "#c8ff57", accentFg: "#000",
    text: "#e0e0e0", muted: "#484848", dim: "#777", bright: "#bbb",
    danger: "#ff5555",
  };
}

// Cache theme colors to avoid recreating identical objects
const COLORS_DARK = getC("dark");
const COLORS_LIGHT = getC("light");
function getCachedC(theme) {
  return theme === "light" ? COLORS_LIGHT : COLORS_DARK;
}

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
const escapeHtml = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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
            style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 28, height: 28, cursor: "pointer", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {theme === "dark" ? "☀" : "☾"}
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
const NoteRow = memo(function NoteRow({ note, isActive, C, onSelect, onDelete, onToggleTag }) {
  return (
    <div
      className="note-row"
      onClick={() => onSelect(note.id)}
      style={{ padding: "11px 14px 8px", cursor: "pointer", position: "relative", borderLeft: `2px solid ${isActive ? C.accent : "transparent"}`, background: isActive ? C.surface2 : "transparent" }}>
      {/* Title row */}
      <div style={{ color: C.text, fontSize: 13, fontWeight: 600, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: 12 }}>{note.title}</div>
      {/* Tag badges */}
      {(note.important || note.personal || note.client) && (
        <div style={{ display: "flex", gap: 4, marginBottom: 4, flexWrap: "wrap" }}>
          {note.important && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#f5a62322", color: "#f5a623", border: "1px solid #f5a62344" }}>⭐ important</span>}
          {note.personal && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#22d3ee30", color: "#22d3ee", border: "1px solid #22d3ee55" }}>👤 personal</span>}
          {note.client && <span style={{ fontSize: 10, padding: "1px 5px", borderRadius: 3, background: "#e879f930", color: "#e879f9", border: "1px solid #e879f955" }}>💼 client</span>}
        </div>
      )}
      <div style={{ color: C.bright, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{timeAgo(note.updatedAt)}</div>
      <div style={{ color: C.dim, fontSize: 11 }}>
        {formatDateTime(note.updatedAt)}
        {note.images?.length > 0 && <span style={{ marginLeft: 6 }}>🖼 {note.images.length}</span>}
      </div>
      {/* Delete button */}
      <button
        onClick={e => { e.stopPropagation(); onDelete(note.id); }}
        title="Delete prompt"
        className="note-delete-btn"
        style={{ position: "absolute", top: 10, right: 4, background: "#ff444422", border: "1px solid #ff444455", color: "#ff6666", width: 20, height: 20, borderRadius: "50%", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1, fontWeight: 700 }}
      >×</button>
      {/* Hover tag strip */}
      <div className="tag-bar" style={{ display: "flex", gap: 4, marginTop: 6, paddingTop: 6, borderTop: `1px solid ${C.border}` }}>
        {[{ tag: "important", icon: "⭐", col: "#f5a623" }, { tag: "personal", icon: "👤", col: "#22d3ee" }, { tag: "client", icon: "💼", col: "#e879f9" }].map(({ tag, icon, col }) => (
          <button key={tag}
            onClick={e => { e.stopPropagation(); onToggleTag(note.id, tag); }}
            title={`Mark as ${tag}`}
            className="tag-toggle-btn"
            style={{
              flex: 1, fontSize: 11, padding: "3px 0", borderRadius: 4, cursor: "pointer", fontFamily: mono,
              background: note[tag] ? col + "33" : "transparent",
              border: `1px solid ${note[tag] ? col : C.border}`,
              color: note[tag] ? col : C.dim,
            }}>{icon}</button>
        ))}
      </div>
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

const RAIL = [
  { id: null, icon: "📋", label: "All" },
  { id: "important", icon: "⭐", label: "Important" },
  { id: "personal", icon: "👤", label: "Personal" },
  { id: "client", icon: "💼", label: "Client" },
];

const TAG_DEFS = [
  { tag: "important", icon: "⭐", col: "#f5a623" },
  { tag: "personal", icon: "👤", col: "#22d3ee" },
  { tag: "client", icon: "💼", col: "#e879f9" },
];

export default function PromptNotepad() {
  const [theme, setTheme] = useState(() => localStorage.getItem("pn-theme") || "dark");
  const C = getCachedC(theme);
  const toggleTheme = useCallback(() => setTheme(t => { const n = t === "dark" ? "light" : "dark"; localStorage.setItem("pn-theme", n); return n; }), []);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
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

  // Separate local text state for instant typing response
  const [localText, setLocalText] = useState("");
  const [localTitle, setLocalTitle] = useState("");

  const saveTimer = useRef(null);
  const editorRef = useRef(null);
  const backdropRef = useRef(null);
  const fileInputRef = useRef(null);
  const toastTimer = useRef(null);

  const activeNote = useMemo(() => notes.find(n => n.id === activeId) || null, [notes, activeId]);

  // Sync local text/title when active note changes (from sidebar click, etc.)
  useEffect(() => {
    if (activeNote) {
      setLocalText(activeNote.text);
      setLocalTitle(activeNote.title);
    } else {
      setLocalText("");
      setLocalTitle("");
    }
  }, [activeId]); // Only on activeId change, not on every note update

  const openCarousel = useCallback((images, index) => setCarousel({ images, index }), []);
  const closeCarousel = useCallback(() => setCarousel(null), []);
  const carouselPrev = useCallback(() => setCarousel(c => ({ ...c, index: (c.index - 1 + c.images.length) % c.images.length })), []);
  const carouselNext = useCallback(() => setCarousel(c => ({ ...c, index: (c.index + 1) % c.images.length })), []);

  useEffect(() => { document.body.style.background = C.bg; }, [C.bg]);

  useEffect(() => {
    if (activeId) {
      const activeNote = notes.find(n => n.id === activeId);
      if (activeNote) {
        const slug = makeSlug(activeNote.title, activeNote.createdAt);
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const mapped = (data || []).map(row => ({
        id: row.id, title: row.title, text: row.text, images: row.images || [],
        important: row.important || false, personal: row.personal || false, client: row.client || false,
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
      } else if (mapped.length > 0) {
        setActiveId(mapped[0].id);
      }
      
      setFetchError(null);
    } catch (e) {
      console.error(e);
      setFetchError(e.message || "Failed to fetch notes");
    } finally {
      setLoaded(true);
    }
  };

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
  }, [userId]);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  }, []);

  const debouncedSave = useCallback((note) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("notes").upsert({
        id: note.id, user_id: user.id, title: note.title, text: note.text,
        images: note.images,
        important: note.important || false, personal: note.personal || false, client: note.client || false,
        updated_at: new Date().toISOString(),
      });
      if (error) { console.error("Save error:", error); showToast("Sync failed — check connection", "error"); }
      setSaving(false);
    }, 800);
  }, [user, showToast]);

  const createNote = useCallback(async () => {
    const note = { id: generateId(), title: "Untitled Prompt", text: "", images: [], important: false, personal: false, client: false, createdAt: Date.now(), updatedAt: Date.now() };
    const { error } = await supabase.from("notes").insert({
      id: note.id, user_id: user.id, title: note.title, text: note.text, images: note.images,
      important: false, personal: false, client: false,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    });
    if (error) { console.error(error); return; }
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    setMobOpen(false);
    setTimeout(() => editorRef.current?.focus(), 50);
  }, [user]);

  const deleteNote = useCallback(async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) { console.error(error); return; }
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (activeId === id) setActiveId(updated[0]?.id || null);
      return updated;
    });
  }, [activeId]);

  const updateNote = useCallback((id, patch) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, ...patch, updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

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
    if (!activeId) return;
    for (const item of (e.clipboardData?.items || [])) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const reader = new FileReader();
        reader.onload = ev => addImageToNote(activeId, ev.target.result);
        reader.readAsDataURL(item.getAsFile());
        return;
      }
    }
  }, [activeId, addImageToNote]);

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

  const syncBackdropScroll = useCallback((e) => {
    if (backdropRef.current) {
      backdropRef.current.scrollTop = e.target.scrollTop;
      backdropRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  const copyText = useCallback(() => { if (!localText) return; navigator.clipboard.writeText(localText).then(() => showToast("Copied ✓", "success")).catch(() => showToast("Copy failed", "error")); }, [localText, showToast]);

  const downloadTxt = useCallback(() => {
    if (!activeNote) return;
    const blob = new Blob([localText], { type: "text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${localTitle.replace(/[^a-z0-9]/gi, "_")}.txt` });
    a.click(); URL.revokeObjectURL(a.href); showToast("Downloaded .txt ✓", "success");
  }, [activeNote, localText, localTitle, showToast]);

  const downloadDoc = useCallback(() => {
    if (!activeNote) return;
    const lines = localText.split("\n")
      .map(l => `<p style="font-family:Calibri,sans-serif;font-size:12pt;margin:0 0 6pt">${escapeHtml(l) || "&nbsp;"}</p>`)
      .join("");
    const imgs = (activeNote.images || []).map((img, i) =>
      `<p style="margin:12pt 0 4pt;font-family:Calibri;font-size:9pt;color:#888">Image ${i + 1}</p>` +
      `<p><img src="${img.dataUrl}" style="max-width:6.5in;width:100%;border:1pt solid #ddd"/></p>`
    ).join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"/>
<style>
  @page {
    size: 8.5in 11in;
    margin: 1in;
    mso-header-margin: .5in;
    mso-footer-margin: .5in;
    mso-paper-source: 0;
  }
  body {
    font-family: Calibri, sans-serif;
    font-size: 12pt;
    margin: 1in;
  }
  p { margin: 0 0 6pt; }
  img { max-width: 100%; height: auto; }
</style>
</head>
<body>
<h1 style="font-family:Calibri;font-size:16pt;margin:0 0 14pt;color:#111">${escapeHtml(localTitle)}</h1>
${lines}
${imgs ? `<p style="margin:18pt 0 6pt;font-family:Calibri;font-size:11pt;font-weight:bold;color:#444;border-top:1pt solid #ddd;padding-top:10pt">Attached Images</p>${imgs}` : ""}
</body></html>`;
    const blob = new Blob(["\ufeff", html], { type: "application/msword" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: `${localTitle.replace(/[^a-z0-9]/gi, "_")}.doc` });
    a.click(); URL.revokeObjectURL(a.href); showToast("Downloaded .doc ✓", "success");
  }, [activeNote, localText, localTitle, showToast]);

  const signOut = useCallback(async () => { await supabase.auth.signOut(); setNotes([]); setActiveId(null); setLoaded(false); }, []);

  const filteredNotes = useMemo(() => filterTag ? notes.filter(n => n[filterTag]) : notes, [notes, filterTag]);

  // Storage usage calculation — memoized to avoid recomputing on every render
  const STORAGE_LIMIT = 500 * 1024 * 1024; // 500 MB
  const storageUsed = useMemo(() => {
    return notes.reduce((acc, n) => {
      let size = estimateBytesFast(n.title) + estimateBytesFast(n.text);
      (n.images || []).forEach(img => { size += estimateBytesFast(img.dataUrl || ""); });
      return acc + size;
    }, 0);
  }, [notes]);
  const storagePercent = Math.min((storageUsed / STORAGE_LIMIT) * 100, 100);
  const storageColor = storagePercent > 90 ? C.danger : storagePercent > 70 ? "#f5a623" : C.accent;

  // Stable callbacks for NoteRow
  const handleNoteSelect = useCallback((id) => { setActiveId(id); setMobOpen(false); }, []);

  // Handle text input — update local state instantly, debounce remote save
  const handleTextChange = useCallback((e) => {
    const text = e.target.value;
    const firstLine = text.trim().split("\n")[0].slice(0, 50);
    const newTitle = firstLine || "Untitled Prompt";
    setLocalText(text);
    setLocalTitle(newTitle);
    updateNote(activeId, { text, title: newTitle });
  }, [activeId, updateNote]);

  // Handle title input
  const handleTitleChange = useCallback((e) => {
    const title = e.target.value;
    setLocalTitle(title);
    updateNote(activeId, { title });
  }, [activeId, updateNote]);

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
        <b>Pro tip:</b> If it says "column does not exist", make sure you ran the SQL migration to add the <code>important</code>, <code>personal</code>, and <code>client</code> columns in your Supabase dashboard.
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
          <span style={{ color: C.accent, fontSize: 15, fontWeight: 700, letterSpacing: "0.07em" }}>⌘ PROMPTS</span>
          <button onClick={toggleTheme} style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 30, height: 30, cursor: "pointer", fontSize: 14 }}>{theme === "dark" ? "☀" : "☾"}</button>
        </div>


        {/* Sidebar */}
        <aside className={`sidebar${mobOpen ? ' mob-open' : ''}`} style={{ background: C.surface, borderRight: `1px solid ${C.border}` }}>
          <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.border}` }}>
            {/* Row 1: title + new button */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 14px 8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <button className="sidebar-close-btn" onClick={() => setMobOpen(false)}
                  style={{ background: "transparent", border: `1px solid ${C.border}`, color: C.dim, borderRadius: 4, width: 26, height: 26, cursor: "pointer", fontSize: 16, display: "none", alignItems: "center", justifyContent: "center" }}>
                  &times;
                </button>
                <span style={{ color: C.accent, fontSize: 15, fontWeight: 700, letterSpacing: "0.07em" }}>⌘ PROMPTS</span>
              </div>
              <button onClick={createNote} style={{ background: C.accent, color: "#000", border: "none", borderRadius: 4, width: 26, height: 26, fontSize: 20, cursor: "pointer", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
            </div>
            {/* Row 2: tag filter icons */}
            <div style={{ display: "flex", gap: 4, padding: "0 14px 10px" }}>
              {RAIL.map(r => (
                <button key={String(r.id)} onClick={() => setFilterTag(filterTag === r.id ? null : r.id)} title={r.label}
                  style={{ flex: 1, background: filterTag === r.id ? C.accent + "22" : "transparent", border: `1px solid ${filterTag === r.id ? C.accent + "66" : C.border}`, borderRadius: 4, height: 26, fontSize: 13, cursor: "pointer" }}>{r.icon}</button>
              ))}
            </div>
          </div>

          <div className="sidebar-list">
            {filteredNotes.length === 0 && <div style={{ color: C.muted, fontSize: 13, textAlign: "center", padding: "32px 14px", lineHeight: 1.8 }}>{filterTag ? `No ${filterTag} prompts.` : "No prompts yet."}<br />{filterTag ? "" : "Hit + to start."}</div>}
            {filteredNotes.map(n => (
              <NoteRow
                key={n.id}
                note={n}
                isActive={n.id === activeId}
                C={C}
                onSelect={handleNoteSelect}
                onDelete={deleteNote}
                onToggleTag={toggleTag}
              />
            ))}
          </div>

          <div className="sidebar-footer" style={{ borderTop: `1px solid ${C.border}`, padding: "10px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: saving ? "#f5a623" : C.accent, flexShrink: 0 }} />
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

        {/* Editor */}
        <main className="editor-main" style={{ background: C.bg }}>
          {!activeNote ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16 }}>
              <div style={{ fontSize: 52, opacity: 0.1 }}>✎</div>
              <div style={{ color: C.muted, fontSize: 15 }}>Create a new prompt to get started</div>
              <button onClick={createNote} style={{ background: C.accent, color: "#000", border: "none", borderRadius: 5, padding: "10px 24px", fontFamily: mono, fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: "0.06em" }}>+ NEW PROMPT</button>
            </div>
          ) : (
            <>
              <div className="editor-toolbar" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
                <input value={localTitle} onChange={handleTitleChange} placeholder="Prompt title…"
                  style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: C.text, fontFamily: mono, fontSize: 15, fontWeight: 700, minWidth: 0 }} />
                <div className="editor-tools" style={{ display: "flex", gap: 6, flexShrink: 0, alignItems: "center" }}>
                  <button onClick={copyText} className="tool-btn" style={toolBtnStyle}>Copy</button>
                  <button onClick={downloadTxt} className="tool-btn" style={toolBtnStyle}>↓ .txt</button>
                  <button onClick={downloadDoc} className="tool-btn" style={toolBtnStyle}>↓ .doc</button>
                  <button onClick={() => fileInputRef.current?.click()} className="tool-btn" style={toolBtnStyle}>+ Image</button>
                  <button onClick={toggleTheme} title={theme === "dark" ? "Light mode" : "Dark mode"}
                    style={{ ...toolBtnStyle, fontSize: 15, padding: "4px 9px" }}>
                    {theme === "dark" ? "☀" : "☾"}
                  </button>
                </div>
              </div>
              <div className="editor-body">

                <div className="editor-text-wrap">
                  <EditorBackdrop text={localText} C={C} backdropRef={backdropRef} />
                  <textarea ref={editorRef} value={localText}
                    onChange={handleTextChange}
                    onClick={handleLinkClick}
                    onScroll={syncBackdropScroll}
                    placeholder={"Write your prompt here…\n\nPaste image: Ctrl+V / Cmd+V\nOr click '+ Image' to attach from file"}
                    spellCheck={false}
                    style={{
                      position: "relative", zIndex: 1,
                      width: "100%", height: "100%",
                      background: "transparent", border: "none", outline: "none", resize: "none",
                      color: "transparent", caretColor: C.text,
                      fontFamily: mono, fontSize: 15, lineHeight: 1.85, padding: "22px",
                    }}
                  />
                </div>

                {activeNote.images?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "0 22px 14px" }}>
                    {activeNote.images.map((img, idx) => (
                      <div key={img.id} style={{ position: "relative", border: `1px solid ${C.border}`, borderRadius: 6, overflow: "hidden", lineHeight: 0 }}>
                        <img src={img.dataUrl} onClick={() => openCarousel(activeNote.images, idx)}
                          className="img-thumb" style={{ maxWidth: 320, maxHeight: 240, display: "block", objectFit: "contain", background: "#111", cursor: "zoom-in" }} alt="" />
                        <button onClick={() => removeImage(activeNote.id, img.id)} style={{ position: "absolute", top: 5, right: 5, background: "rgba(0,0,0,0.75)", border: "none", color: "#fff", width: 22, height: 22, borderRadius: "50%", fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ padding: "8px 22px", borderTop: `1px solid ${C.border}`, color: C.muted, fontSize: 12, display: "flex", justifyContent: "space-between", flexShrink: 0 }}>
                  <span>Ctrl+Click to open links · Ctrl+V paste image</span>
                  <span>{localText.length} chars</span>
                </div>
              </div>{/* end editor-body */}
            </>
          )}
        </main>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFileInputWithToast} />
    </div>
  );
}
