import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, LayoutDashboard, UserRound, LogOut, Plus, Search, Tags, Pencil, Trash2, X, Clock3, FileText, CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, Mail, LockKeyhole, Eye, EyeOff, Sparkles } from "lucide-react";

const API = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");
const tokenKey = "inkwell_auth_token";
const blankBlog = { title: "", category: "Technology", content: "" };
const dateLabel = (date) => new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || "");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState("");
  const [page, setPage] = useState("dashboard");
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [blogForm, setBlogForm] = useState(blankBlog);
  const [saving, setSaving] = useState(false);

  const logout = useCallback((message = "") => {
    localStorage.removeItem(tokenKey);
    setToken(""); setUser(null); setBlogs([]); setPage("dashboard");
    setNotice(message ? { type: "success", text: message } : null);
  }, []);

  const request = useCallback(async (path, options = {}) => {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { ...(options.body ? { "Content-Type": "application/json" } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    });
    const data = await response.json().catch(() => ({}));
    if (response.status === 401 && path !== "/auth/login" && path !== "/auth/register") {
      logout("Your session expired. Please sign in again.");
      throw new Error(data.message || "Session expired.");
    }
    if (!response.ok) throw new Error(data.message || "Something went wrong.");
    return data;
  }, [token, logout]);

  useEffect(() => {
    let active = true;
    if (!token) { setAuthChecked(true); return () => { active = false; }; }
    (async () => {
      try {
        const data = await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
        const result = await data.json();
        if (!data.ok) throw new Error(result.message || "Session expired.");
        if (active) setUser(result.user);
      } catch {
        localStorage.removeItem(tokenKey);
        if (active) { setToken(""); setUser(null); }
      } finally { if (active) setAuthChecked(true); }
    })();
    return () => { active = false; };
  }, [token]);

  const loadBlogs = useCallback(async () => {
    if (!token || !user) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (category !== "All categories") params.set("category", category);
      const data = await request(`/blogs?${params.toString()}`);
      setBlogs(data);
    } catch (error) {
      if (!/session expired|log in again/i.test(error.message)) setNotice({ type: "error", text: error.message });
    } finally { setLoading(false); }
  }, [token, user, search, category, request]);

  useEffect(() => { const timer = setTimeout(loadBlogs, 220); return () => clearTimeout(timer); }, [loadBlogs]);

  const allCategories = useMemo(() => [...new Set([...categories, ...blogs.map(b => b.category)])].sort(), [categories, blogs]);
  useEffect(() => { setCategories(allCategories); }, [allCategories]);

  async function submitAuth(event) {
    event.preventDefault(); setAuthBusy(true); setAuthError("");
    try {
      const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
      const response = await fetch(`${API}${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(authForm)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Authentication failed.");
      localStorage.setItem(tokenKey, data.token);
      setToken(data.token); setUser(data.user); setAuthChecked(true); setPage("dashboard"); setAuthForm({ name: "", email: "", password: "" });
    } catch (error) { setAuthError(error.message); }
    finally { setAuthBusy(false); }
  }

  function openCreate() { setEditing(null); setBlogForm(blankBlog); setModal(true); }
  function openEdit(blog) { setEditing(blog); setBlogForm({ title: blog.title, category: blog.category, content: blog.content }); setModal(true); }

  async function saveBlog(event) {
    event.preventDefault(); setSaving(true); setNotice(null);
    try {
      await request(editing ? `/blogs/${editing._id}` : "/blogs", {
        method: editing ? "PUT" : "POST", body: JSON.stringify(blogForm)
      });
      setModal(false); setNotice({ type: "success", text: editing ? "Blog updated successfully." : "Blog published successfully." });
      await loadBlogs();
    } catch (error) { setNotice({ type: "error", text: error.message }); }
    finally { setSaving(false); }
  }

  async function deleteBlog(blog) {
    if (!window.confirm(`Delete “${blog.title}”? This cannot be undone.`)) return;
    try { await request(`/blogs/${blog._id}`, { method: "DELETE" }); setNotice({ type: "success", text: "Blog deleted." }); await loadBlogs(); }
    catch (error) { setNotice({ type: "error", text: error.message }); }
  }

  if (!authChecked || (token && !user)) return <div className="screen-loading"><div className="loader-mark"><BookOpen /></div><span className="spinner" /> Securing your workspace…</div>;

  if (!token || !user) return <div className="auth-screen">
    <div className="auth-brand"><span className="brand-icon"><BookOpen size={21}/></span> InkWell<span className="brand-dot">.</span></div>
    <div className="auth-layout">
      <section className="auth-story"><span className="eyebrow"><Sparkles size={14}/> YOUR PERSONAL WRITING SPACE</span><h1>Your ideas.<br/><em>Your space.</em></h1><p>A thoughtful home for every story you want to tell. Sign in and pick up right where inspiration left you.</p><div className="auth-feature"><span><ShieldCheck size={18}/></span><div><strong>Private by design</strong><small>Your blogs are visible only to your account.</small></div></div><div className="auth-feature"><span><CheckCircle2 size={18}/></span><div><strong>All your work, together</strong><small>Create, edit, and manage your stories with ease.</small></div></div><div className="auth-decoration"><div className="decoration-sheet"><div/><div/><div/><div/></div><span className="decoration-star">✳</span></div></section>
      <section className="auth-panel"><div className="auth-panel-heading"><span className="section-kicker">{authMode === "login" ? "WELCOME BACK" : "BEGIN YOUR STORY"}</span><h2>{authMode === "login" ? "Sign in to InkWell" : "Create your account"}</h2><p>{authMode === "login" ? "Enter your details to access your dashboard." : "A few details and your writing space is ready."}</p></div>
        {authError && <div className="notice error"><AlertCircle size={16}/>{authError}</div>}
        <form className="auth-form" onSubmit={submitAuth}>
          {authMode === "register" && <label>Full name<span className="field-wrap"><UserRound size={17}/><input value={authForm.name} onChange={e=>setAuthForm({...authForm,name:e.target.value})} placeholder="Your name" maxLength={80} required autoComplete="name"/></span></label>}
          <label>Email address<span className="field-wrap"><Mail size={17}/><input type="email" value={authForm.email} onChange={e=>setAuthForm({...authForm,email:e.target.value})} placeholder="you@example.com" required autoComplete="email"/></span></label>
          <label>Password<span className="field-wrap"><LockKeyhole size={17}/><input type={showPassword?"text":"password"} value={authForm.password} onChange={e=>setAuthForm({...authForm,password:e.target.value})} placeholder={authMode==="register"?"At least 8 characters":"Enter your password"} minLength={authMode==="register"?8:1} maxLength={72} required autoComplete={authMode==="login"?"current-password":"new-password"}/><button type="button" className="show-password" onClick={()=>setShowPassword(!showPassword)} aria-label={showPassword?"Hide password":"Show password"}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></span></label>
          <button className="primary-btn auth-submit" disabled={authBusy}>{authBusy ? "Please wait…" : authMode==="login" ? <>Sign in <ArrowRight size={17}/></> : <>Create account <ArrowRight size={17}/></>}</button>
        </form>
        <div className="auth-switch">{authMode==="login"?"New to InkWell?":"Already have an account?"}<button onClick={()=>{setAuthMode(authMode==="login"?"register":"login");setAuthError("");}}> {authMode==="login"?"Create an account":"Sign in"}</button></div><div className="auth-privacy"><ShieldCheck size={14}/> Passwords are securely hashed. Your blogs stay yours.</div>
      </section>
    </div><footer className="auth-footer">© {new Date().getFullYear()} InkWell <span>Thoughtful tools for thoughtful writing.</span></footer>
  </div>;

  return <div className="dashboard-shell">
    <aside className="sidebar"><a className="brand" href="#" onClick={e=>{e.preventDefault();setPage("dashboard");}}><span className="brand-icon"><BookOpen size={20}/></span><span>InkWell<span className="brand-dot">.</span></span></a><div className="workspace-label">WORKSPACE</div><button className={`nav-item ${page==="dashboard"?"active":""}`} onClick={()=>setPage("dashboard")}><LayoutDashboard size={18}/> Dashboard</button><button className={`nav-item ${page==="profile"?"active":""}`} onClick={()=>setPage("profile")}><UserRound size={18}/> My profile</button><div className="sidebar-bottom"><div className="security-card"><ShieldCheck size={19}/><strong>Your space is private</strong><p>Only you can access and manage your blog posts.</p></div><div className="sidebar-user"><span className="user-avatar">{user.name.slice(0,1).toUpperCase()}</span><div className="user-summary"><strong>{user.name}</strong><small>{user.email}</small></div><button className="logout-icon" onClick={()=>logout()} title="Log out" aria-label="Log out"><LogOut size={17}/></button></div></div></aside>
    <main className="dashboard-main"><header className="dash-topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>{page==="dashboard"?"Dashboard":"My profile"}</strong></div><div className="top-user"><span className="online-dot"/><span>{user.name}</span><span className="user-avatar small">{user.name.slice(0,1).toUpperCase()}</span></div></header>
      {page==="dashboard" ? <div className="dash-content"><section className="welcome-banner"><div><span className="eyebrow"><Sparkles size={13}/> YOUR WRITING WORKSPACE</span><h1>Good things start<br/>with an <em>idea.</em></h1><p>Welcome back, {user.name.split(" ")[0]}. What will you write today?</p><button className="primary-btn" onClick={openCreate}><Plus size={17}/> Write a blog</button></div><div className="welcome-illustration"><div className="welcome-ring"/><div className="welcome-paper"><span>YOUR NEXT STORY</span><strong>Make room<br/>for ideas.</strong><div/><div/><div/></div><div className="welcome-sticker"><Pencil size={16}/> Create something</div></div></section>
        <section className="dashboard-stats"><div className="dash-stat"><span className="stat-icon"><FileText size={18}/></span><div><strong>{blogs.length}</strong><small>Your blog posts</small></div></div><div className="dash-stat"><span className="stat-icon purple"><Tags size={18}/></span><div><strong>{allCategories.length}</strong><small>Categories used</small></div></div><div className="dash-stat"><span className="stat-icon green"><ShieldCheck size={18}/></span><div><strong>Private</strong><small>Personal workspace</small></div></div></section>
        <section className="posts-section"><div className="posts-heading"><div><span className="section-kicker">YOUR COLLECTION</span><h2>Your blog posts</h2><p>Only your stories appear here.</p></div><button className="primary-btn" onClick={openCreate}><Plus size={16}/> New post</button></div>
          <div className="filters"><label className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search your posts…" aria-label="Search your posts"/>{search&&<button onClick={()=>setSearch("")} aria-label="Clear search"><X size={14}/></button>}</label><label className="category-select"><Tags size={16}/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All categories</option>{allCategories.map(c=><option key={c}>{c}</option>)}</select></label></div>
          {notice&&<div className={`notice ${notice.type}`}>{notice.type==="success"?<CheckCircle2 size={16}/>:<AlertCircle size={16}/>}<span>{notice.text}</span><button onClick={()=>setNotice(null)} aria-label="Dismiss"><X size={15}/></button></div>}
          {loading?<div className="empty-state"><span className="spinner"/><p>Loading your posts…</p></div>:blogs.length===0?<div className="empty-state"><span className="empty-book"><BookOpen size={25}/></span><h3>{search||category!=="All categories"?"No matching posts":"Your story starts here"}</h3><p>{search||category!=="All categories"?"Try another search or category.":"Your dashboard is ready. Create your first blog post."}</p>{!search&&category==="All categories"&&<button className="primary-btn" onClick={openCreate}><Plus size={16}/> Create first post</button>}</div>:<div className="post-grid">{blogs.map((blog,i)=><article className="post-card" key={blog._id}><div className={`post-art art-${i%4}`}><span className="post-category">{blog.category}</span><span className="post-num">{String(i+1).padStart(2,"0")}</span><div className="art-letter">{blog.category.slice(0,1).toUpperCase()}</div></div><div className="post-body"><div className="post-date"><Clock3 size={13}/>{dateLabel(blog.updatedAt||blog.createdAt)}</div><h3>{blog.title}</h3><p>{blog.content.length>125?blog.content.slice(0,125).trim()+"…":blog.content}</p><div className="post-actions"><span>YOUR STORY <ArrowRight size={13}/></span><div><button onClick={()=>openEdit(blog)} aria-label={`Edit ${blog.title}`}><Pencil size={15}/></button><button className="delete-button" onClick={()=>deleteBlog(blog)} aria-label={`Delete ${blog.title}`}><Trash2 size={15}/></button></div></div></div></article>)}</div>}
        </section></div>:<section className="profile-content"><div className="profile-heading"><span className="section-kicker">ACCOUNT SETTINGS</span><h1>Your profile</h1><p>Your personal details and account information.</p></div><div className="profile-card"><div className="profile-cover"><span className="profile-avatar">{user.name.slice(0,1).toUpperCase()}</span></div><div className="profile-details"><span className="profile-badge"><CheckCircle2 size={13}/> Account active</span><h2>{user.name}</h2><p>Your InkWell account</p><div className="profile-field"><span><UserRound size={17}/> Full name</span><strong>{user.name}</strong></div><div className="profile-field"><span><Mail size={17}/> Email address</span><strong>{user.email}</strong></div><div className="profile-field"><span><Clock3 size={17}/> Member since</span><strong>{dateLabel(user.createdAt)}</strong></div><div className="profile-field"><span><FileText size={17}/> Your blog posts</span><strong>{blogs.length}</strong></div><button className="secondary-btn profile-logout" onClick={()=>logout()}><LogOut size={16}/> Log out of your account</button></div></div></section>}
      <footer className="dash-footer"><span className="footer-logo"><BookOpen size={15}/> InkWell<span className="brand-dot">.</span></span><span>Made for ideas that deserve a page.</span><span><ShieldCheck size={13}/> Private workspace</span></footer>
    </main>
    {modal&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget&&!saving)setModal(false);}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="blog-modal-title"><div className="modal-head"><div><span className="section-kicker">{editing?"REFINE YOUR STORY":"START SOMETHING NEW"}</span><h2 id="blog-modal-title">{editing?"Edit your blog":"Write a new blog"}</h2><p>Your post will be saved to your private account.</p></div><button className="modal-close" onClick={()=>!saving&&setModal(false)} aria-label="Close"><X size={19}/></button></div><form className="blog-form" onSubmit={saveBlog}><label>Blog title<input value={blogForm.title} onChange={e=>setBlogForm({...blogForm,title:e.target.value})} maxLength={140} placeholder="Give your story a title" required/></label><label>Category<input value={blogForm.category} onChange={e=>setBlogForm({...blogForm,category:e.target.value})} maxLength={50} list="categories" placeholder="e.g. Technology" required/><datalist id="categories">{allCategories.map(c=><option key={c} value={c}/>)}</datalist></label><label>Story<textarea value={blogForm.content} onChange={e=>setBlogForm({...blogForm,content:e.target.value})} rows={7} placeholder="Start writing here…" required/></label><div className="form-foot"><span>{blogForm.content.trim().split(/\s+/).filter(Boolean).length} words</span><div><button type="button" className="secondary-btn" onClick={()=>setModal(false)} disabled={saving}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?"Saving…":editing?<><CheckCircle2 size={16}/> Save changes</>:<><Plus size={16}/> Publish blog</>}</button></div></div></form></section></div>}
  </div>;
}
