import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

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

const C = {
  bg: "#0f0f0f", surface: "#141414", surface2: "#1a1a1a",
  border: "#242424", accent: "#c8ff57", text: "#e0e0e0",
  muted: "#484848", dim: "#777", bright: "#bbb", danger: "#ff5555",
};
const mono = "'JetBrains Mono','Fira Code','Cascadia Code',monospace";

function AuthScreen() {
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

  const inp = { width:"100%", background:C.surface2, border:`1px solid ${C.border}`, borderRadius:5, padding:"10px 13px", color:C.text, fontFamily:mono, fontSize:13, outline:"none", boxSizing:"border-box" };

  if (done) return (
    <div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"40px 36px",width:340,textAlign:"center"}}>
        <div style={{fontSize:36,marginBottom:16}}>📬</div>
        <div style={{color:C.text,fontSize:15,fontWeight:700,marginBottom:8}}>Check your email</div>
        <div style={{color:C.dim,fontSize:12,lineHeight:1.7}}>
          Confirmation link sent to<br/>
          <span style={{color:C.accent}}>{email}</span><br/>
          Click it then come back to log in.
        </div>
        <button onClick={()=>{setDone(false);setMode("login");}}
          style={{marginTop:20,background:"transparent",border:`1px solid ${C.border}`,color:C.dim,fontFamily:mono,fontSize:12,padding:"7px 16px",borderRadius:4,cursor:"pointer"}}>
          Back to login
        </button>
      </div>
    </div>
  );

  return (
    <div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono}}>
      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"40px 36px",width:340}}>
        <div style={{color:C.accent,fontSize:18,fontWeight:700,letterSpacing:"0.07em",marginBottom:6}}>⌘ PROMPTS</div>
        <div style={{color:C.dim,fontSize:12,marginBottom:28}}>{mode==="login"?"Sign in to your notepad":"Create a free account"}</div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <input type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          <input type="password" placeholder="Password (min 6 chars)" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} style={inp}/>
          {error&&<div style={{color:C.danger,fontSize:11,padding:"7px 10px",background:"#ff000015",borderRadius:4,border:"1px solid #ff000030"}}>{error}</div>}
          <button onClick={submit} disabled={loading||!email||!password}
            style={{background:C.accent,color:"#000",border:"none",borderRadius:5,padding:"10px",fontFamily:mono,fontSize:13,fontWeight:700,cursor:loading?"not-allowed":"pointer",opacity:loading?0.7:1,letterSpacing:"0.05em"}}>
            {loading?"…":mode==="login"?"Sign In":"Create Account"}
          </button>
        </div>
        <div style={{marginTop:20,textAlign:"center",color:C.muted,fontSize:11}}>
          {mode==="login"?"No account? ":"Already have one? "}
          <button onClick={()=>{setMode(mode==="login"?"signup":"login");setError("");}}
            style={{background:"none",border:"none",color:C.accent,cursor:"pointer",fontFamily:mono,fontSize:11,textDecoration:"underline"}}>
            {mode==="login"?"Sign up free":"Log in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PromptNotepad() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const saveTimer = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const activeNote = notes.find(n => n.id === activeId) || null;

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

  useEffect(() => {
    if (!user) { setNotes([]); setLoaded(false); return; }
    fetchNotes();
  }, [user]);

  const fetchNotes = async () => {
    const { data, error } = await supabase.from("notes").select("*").order("updated_at", { ascending: false });
    if (error) { console.error(error); return; }
    const mapped = (data||[]).map(row => ({
      id: row.id, title: row.title, text: row.text, images: row.images||[],
      createdAt: new Date(row.created_at).getTime(),
      updatedAt: new Date(row.updated_at).getTime(),
    }));
    setNotes(mapped);
    if (mapped.length > 0) setActiveId(mapped[0].id);
    setLoaded(true);
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2200); };

  const debouncedSave = useCallback((note) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaving(true);
    saveTimer.current = setTimeout(async () => {
      const { error } = await supabase.from("notes").upsert({
        id: note.id, user_id: user.id, title: note.title, text: note.text,
        images: note.images, updated_at: new Date().toISOString(),
      });
      if (error) console.error("Save error:", error);
      setSaving(false);
    }, 800);
  }, [user]);

  const createNote = async () => {
    const note = { id:generateId(), title:"Untitled Prompt", text:"", images:[], createdAt:Date.now(), updatedAt:Date.now() };
    const { error } = await supabase.from("notes").insert({
      id:note.id, user_id:user.id, title:note.title, text:note.text, images:note.images,
      created_at:new Date().toISOString(), updated_at:new Date().toISOString(),
    });
    if (error) { console.error(error); return; }
    setNotes(prev => [note, ...prev]);
    setActiveId(note.id);
    setTimeout(() => editorRef.current?.focus(), 50);
  };

  const deleteNote = async (id) => {
    const { error } = await supabase.from("notes").delete().eq("id", id);
    if (error) { console.error(error); return; }
    setNotes(prev => {
      const updated = prev.filter(n => n.id !== id);
      if (activeId === id) setActiveId(updated[0]?.id || null);
      return updated;
    });
  };

  const updateNote = useCallback((id, patch) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, ...patch, updatedAt: Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  }, [debouncedSave]);

  const addImageToNote = useCallback((id, dataUrl) => {
    const img = { id: generateId(), dataUrl };
    setNotes(prev => prev.map(n => {
      if (n.id !== id) return n;
      const merged = { ...n, images:[...(n.images||[]),img], updatedAt:Date.now() };
      debouncedSave(merged);
      return merged;
    }));
    showToast("Image pasted ✓");
  }, [debouncedSave]);

  const removeImage = (noteId, imgId) => {
    setNotes(prev => prev.map(n => {
      if (n.id !== noteId) return n;
      const merged = { ...n, images:n.images.filter(i=>i.id!==imgId), updatedAt:Date.now() };
      debouncedSave(merged);
      return merged;
    }));
  };

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

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (!file || !activeId) return;
    const reader = new FileReader();
    reader.onload = ev => addImageToNote(activeId, ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const copyText = () => { if (!activeNote?.text) return; navigator.clipboard.writeText(activeNote.text); showToast("Copied ✓"); };

  const downloadTxt = () => {
    if (!activeNote) return;
    const blob = new Blob([activeNote.text], { type:"text/plain;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`${activeNote.title.replace(/[^a-z0-9]/gi,"_")}.txt` });
    a.click(); URL.revokeObjectURL(a.href); showToast("Downloaded .txt ✓");
  };

  const downloadDoc = () => {
    if (!activeNote) return;
    const lines = activeNote.text.split("\n").map(l=>`<p style="font-family:Calibri,sans-serif;font-size:12pt;margin:0 0 6pt">${l.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")||"&nbsp;"}</p>`).join("");
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"/></head><body><h1 style="font-family:Calibri;font-size:16pt">${activeNote.title}</h1>${lines}</body></html>`;
    const blob = new Blob(["\ufeff",html], { type:"application/msword" });
    const a = Object.assign(document.createElement("a"), { href:URL.createObjectURL(blob), download:`${activeNote.title.replace(/[^a-z0-9]/gi,"_")}.doc` });
    a.click(); URL.revokeObjectURL(a.href); showToast("Downloaded .doc ✓");
  };

  const signOut = async () => { await supabase.auth.signOut(); setNotes([]); setActiveId(null); setLoaded(false); };

  if (!authChecked) return (
    <div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono,color:C.muted,gap:10}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/>Connecting…
    </div>
  );

  if (!user) return <AuthScreen />;

  if (!loaded) return (
    <div style={{background:C.bg,height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:mono,color:C.muted,gap:10}}>
      <div style={{width:7,height:7,borderRadius:"50%",background:C.accent}}/>Loading notes…
    </div>
  );

  const toolBtnStyle = { background:"transparent", border:`1px solid ${C.border}`, color:C.dim, fontFamily:mono, fontSize:12, padding:"5px 11px", borderRadius:4, cursor:"pointer" };

  return (
    <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"20px 0",fontFamily:mono,boxSizing:"border-box"}} onPaste={handlePaste}>

      {toast && <div style={{position:"fixed",bottom:22,right:22,background:C.accent,color:"#000",fontSize:13,fontWeight:700,padding:"8px 16px",borderRadius:5,zIndex:999}}>{toast}</div>}

      <div style={{width:"85%",maxWidth:1300,minHeight:"calc(100vh - 40px)",display:"flex",border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden",boxShadow:"0 0 80px rgba(0,0,0,0.55)"}}>

        {/* Sidebar */}
        <aside style={{width:220,minWidth:180,background:C.surface,borderRight:`1px solid ${C.border}`,display:"flex",flexDirection:"column",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"15px 14px",borderBottom:`1px solid ${C.border}`}}>
            <span style={{color:C.accent,fontSize:15,fontWeight:700,letterSpacing:"0.07em"}}>⌘ PROMPTS</span>
            <button onClick={createNote} style={{background:C.accent,color:"#000",border:"none",borderRadius:4,width:26,height:26,fontSize:20,cursor:"pointer",fontWeight:900,display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"4px 0"}}>
            {notes.length===0&&<div style={{color:C.muted,fontSize:13,textAlign:"center",padding:"32px 14px",lineHeight:1.8}}>No prompts yet.<br/>Hit + to start.</div>}
            {notes.map(n=>(
              <div key={n.id} onClick={()=>setActiveId(n.id)}
                style={{padding:"11px 14px",cursor:"pointer",position:"relative",borderLeft:`2px solid ${n.id===activeId?C.accent:"transparent"}`,background:n.id===activeId?C.surface2:"transparent"}}>
                <div style={{color:C.text,fontSize:13,fontWeight:600,marginBottom:5,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",paddingRight:18}}>{n.title}</div>
                <div style={{color:C.bright,fontSize:12,fontWeight:600,marginBottom:2}}>{timeAgo(n.updatedAt)}</div>
                <div style={{color:C.dim,fontSize:11}}>
                  {formatDateTime(n.updatedAt)}
                  {n.images?.length>0&&<span style={{marginLeft:6}}>🖼 {n.images.length}</span>}
                </div>
                <button onClick={e=>{e.stopPropagation();deleteNote(n.id);}} style={{position:"absolute",top:9,right:8,background:"none",border:"none",color:C.muted,fontSize:16,cursor:"pointer",lineHeight:1,padding:2,opacity:0.6}}>×</button>
              </div>
            ))}
          </div>

          <div style={{borderTop:`1px solid ${C.border}`,padding:"10px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:saving?"#f5a623":C.accent,flexShrink:0}}/>
              <span style={{color:C.muted,fontSize:11}}>{saving?"Saving…":"Saved"}</span>
            </div>
            <div style={{color:C.muted,fontSize:10,marginBottom:6,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{user.email}</div>
            <button onClick={signOut} style={{background:"transparent",border:`1px solid ${C.border}`,color:C.muted,fontFamily:mono,fontSize:10,padding:"4px 10px",borderRadius:4,cursor:"pointer",width:"100%"}}>Sign out</button>
          </div>
        </aside>

        {/* Editor */}
        <main style={{flex:1,display:"flex",flexDirection:"column",background:C.bg}}>
          {!activeNote?(
            <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
              <div style={{fontSize:52,opacity:0.1}}>✎</div>
              <div style={{color:C.muted,fontSize:15}}>Create a new prompt to get started</div>
              <button onClick={createNote} style={{background:C.accent,color:"#000",border:"none",borderRadius:5,padding:"10px 24px",fontFamily:mono,fontSize:13,fontWeight:700,cursor:"pointer",letterSpacing:"0.06em"}}>+ NEW PROMPT</button>
            </div>
          ):(
            <>
              <div style={{display:"flex",alignItems:"center",gap:8,padding:"12px 18px",borderBottom:`1px solid ${C.border}`,background:C.surface}}>
                <input value={activeNote.title} onChange={e=>updateNote(activeNote.id,{title:e.target.value})} placeholder="Prompt title…"
                  style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontFamily:mono,fontSize:15,fontWeight:700}}/>
                <div style={{display:"flex",gap:6,flexShrink:0}}>
                  <button onClick={copyText} style={toolBtnStyle}>Copy</button>
                  <button onClick={downloadTxt} style={toolBtnStyle}>↓ .txt</button>
                  <button onClick={downloadDoc} style={toolBtnStyle}>↓ .doc</button>
                  <button onClick={()=>fileInputRef.current?.click()} style={toolBtnStyle}>+ Image</button>
                </div>
              </div>

              <textarea ref={editorRef} value={activeNote.text}
                onChange={e=>{
                  const text=e.target.value;
                  const firstLine=text.trim().split("\n")[0].slice(0,50);
                  updateNote(activeNote.id,{text,title:firstLine||"Untitled Prompt"});
                }}
                placeholder={"Write your prompt here…\n\nPaste image: Ctrl+V / Cmd+V\nOr click '+ Image' to attach from file"}
                spellCheck={false}
                style={{flex:1,background:"transparent",border:"none",outline:"none",resize:"none",color:C.text,fontFamily:mono,fontSize:15,lineHeight:1.85,padding:"22px",minHeight:300}}
              />

              {activeNote.images?.length>0&&(
                <div style={{display:"flex",flexWrap:"wrap",gap:10,padding:"0 22px 14px"}}>
                  {activeNote.images.map(img=>(
                    <div key={img.id} style={{position:"relative",border:`1px solid ${C.border}`,borderRadius:6,overflow:"hidden",lineHeight:0}}>
                      <img src={img.dataUrl} style={{maxWidth:320,maxHeight:240,display:"block",objectFit:"contain",background:"#111"}} alt=""/>
                      <button onClick={()=>removeImage(activeNote.id,img.id)} style={{position:"absolute",top:5,right:5,background:"rgba(0,0,0,0.75)",border:"none",color:"#fff",width:22,height:22,borderRadius:"50%",fontSize:15,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{padding:"8px 22px",borderTop:`1px solid ${C.border}`,color:C.muted,fontSize:12,display:"flex",justifyContent:"space-between"}}>
                <span>⌘/Ctrl+V to paste image · or click + Image</span>
                <span>{activeNote.text.length} chars</span>
              </div>
            </>
          )}
        </main>
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleFileInput}/>
    </div>
  );
}
