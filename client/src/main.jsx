import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { Alert, Button, Form, Input, Modal, Pagination, Popconfirm, Switch, Table, Tag, Tooltip } from "antd";
import {
  KeyOutlined,
  LockOutlined,
  LoginOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  ArrowLeftRight,
  ArrowUpRight,
  Check,
  Copy,
  File,
  FileImage,
  FileVideo,
  LogOut,
  Paperclip,
  Send,
  ShieldCheck,
  Upload,
  Wifi,
  X,
} from "lucide-react";
import "./styles.css";
const API = import.meta.env.VITE_API_BASE || "/api",
  savedUser = JSON.parse(localStorage.getItem("fh_user") || "null");
const routePanel = () => {
  const route = window.location.hash.replace(/^#\/?/, "");
  return ["users", "assets", "password"].includes(route) ? route : null;
};
const esc = (v) =>
    String(v ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    ),
  linkify = (v) =>
    esc(v).replace(
      /(https?:\/\/[^\s<]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    ),
  bytes = (n) =>
    n < 1024
      ? `${n} B`
      : n < 1048576
        ? `${(n / 1024).toFixed(1)} KB`
        : n < 1073741824
          ? `${(n / 1048576).toFixed(1)} MB`
          : `${(n / 1073741824).toFixed(1)} GB`;
const api = (token, path, opt = {}) =>
  fetch(API + path, {
    ...opt,
    headers: { ...(opt.headers || {}), Authorization: `Bearer ${token}` },
  }).then(async (r) => {
    const d = await r.json().catch(() => ({ error: "服务器返回异常" }));
    if (r.status === 401) {
      localStorage.removeItem("fh_token");
      localStorage.removeItem("fh_user");
      window.location.reload();
    }
    if (!r.ok) throw Error(d.error || "请求失败");
    return d;
  });
const fileKinds = {
  pdf: "PDF",
  doc: "WORD",
  docx: "WORD",
  xls: "EXCEL",
  xlsx: "EXCEL",
  ppt: "PPT",
  pptx: "PPT",
  json: "JSON",
  js: "JS",
  ts: "TS",
  html: "HTML",
  css: "CSS",
  zip: "ZIP",
  rar: "RAR",
  "7z": "7Z",
  exe: "EXE",
  msi: "MSI",
  apk: "APK",
  ipa: "IPA",
  mp3: "MP3",
  wav: "WAV",
  flac: "FLAC",
  py: "PY",
  java: "JAVA",
  cpp: "C++",
  c: "C",
  txt: "TXT",
  md: "MD",
};
function fileBadge(name) {
  const ext = (name || "").split(".").pop().toLowerCase(),
    label = fileKinds[ext] || "FILE";
  return (
    <span
      className={`fileTypeIcon fileType-${ext in fileKinds ? ext : "default"}`}
    >
      {label}
    </span>
  );
}
function Auth({ login }) {
  const [err, setErr] = useState("");
  const submit = async (values) => {
    setErr("");
    try {
      const r = await fetch(
          `${API}/auth.php?action=login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          },
        ),
        d = await r.json();
      if (!r.ok) throw Error(d.error);
      localStorage.setItem("fh_token", d.token);
      localStorage.setItem("fh_user", JSON.stringify(d.user));
      login(d.token, d.user);
    } catch (e) {
      setErr(e.message);
    }
  };
  return (
    <main className="authPage">
      <div className="authCard">
        <div className="authBrand">
          <div className="appMark">
            <ArrowLeftRight size={28} strokeWidth={2.4} />
          </div>
          <div>
            <h1>文件互传助手</h1>
            <p>你的私人跨设备传输空间</p>
          </div>
        </div>
        <div className="authIntro">
          <ShieldCheck size={16} />
          安全连接 · 历史记录永久保留
        </div>
        <Form layout="vertical" onFinish={submit} requiredMark={false}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, min: 2, message: "请输入至少 2 位用户名" }]}>
            <Input size="large" prefix={<UserOutlined />} placeholder="输入用户名" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, min: 6, message: "请输入至少 6 位密码" }]}>
            <Input.Password size="large" prefix={<LockOutlined />} placeholder="至少 6 位" />
          </Form.Item>
          <Button type="primary" htmlType="submit" size="large" block icon={<LoginOutlined />}>
            立即登录
          </Button>
          {err && <Alert className="authAlert" type="error" showIcon message={err} />}
        </Form>
      </div>
    </main>
  );
}
function TextBubble({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {}
    if (!ok) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.focus();
      area.select();
      try {
        ok = document.execCommand("copy");
      } catch {}
      document.body.removeChild(area);
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };
  return (
    <div className="bubble textBubble">
      <button
        className="copyButton"
        type="button"
        aria-label="复制消息"
        title="复制消息"
        onClick={(e) => {
          e.stopPropagation();
          copy();
        }}
      >
        {copied ? <Check size={15} /> : <Copy size={15} />}
      </button>
      <span dangerouslySetInnerHTML={{ __html: linkify(text) }} />
    </div>
  );
}
function showPreview({ url, name }) {
  document.querySelector(".previewModal")?.remove();
  const modal = document.createElement("div");
  modal.className = "previewModal";
  modal.innerHTML = `<div class="previewPanel"><button class="previewClose" data-close aria-label="关闭"><span>×</span></button><img src="${url}" alt="图片预览"><div class="previewActions"><b>${esc(name || "图片")}</b><button data-download><span data-download-icon></span>下载图片</button></div></div>`;
  const close = () => modal.remove();
  modal.querySelector("[data-close]").onclick = close;
  createRoot(modal.querySelector("[data-download-icon]")).render(<DownloadOutlined />);
  modal.onclick = (e) => {
    if (e.target === modal) close();
  };
  modal.querySelector("[data-download]").onclick = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "image";
    a.target = "_blank";
    a.click();
  };
  document.body.append(modal);
}
function Message({ m, token, onPreview = showPreview }) {
  const url = m.attachment_id
    ? `${API}/files.php?id=${m.attachment_id}&token=${encodeURIComponent(token)}`
    : "";
  let c;
  if (m.message_type === "text") c = <TextBubble text={m.body} />;
  else if (m.message_type === "image")
    c = (
      <button
        className="imageBubble"
        type="button"
        onClick={() => onPreview({ url, name: m.original_name })}
      >
        <img src={url} alt="图片预览" loading="lazy" />
      </button>
    );
  else if (m.message_type === "video")
    c = (
      <div className="videoBubble">
        <video src={url} controls preload="metadata" />
        <a href={url} target="_blank" rel="noopener noreferrer">
          打开原视频 <ArrowUpRight size={14} />
        </a>
      </div>
    );
  else {
    c = (
      <a
        className="fileBubble"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {fileBadge(m.original_name)}
        <span>
          <strong>{m.original_name}</strong>
          <small>{bytes(Number(m.size_bytes))} · 点击打开</small>
        </span>
        <ArrowUpRight size={17} />
      </a>
    );
  }
  return (
    <article className="messageItem">
      <div>{c}</div>
      <time>
        {new Date(m.created_at.replace(" ", "T") + "Z").toLocaleString()}
      </time>
    </article>
  );
}
function AssetPanel({ token, onClose }) {
  const [items,setItems]=useState([]),[keyword,setKeyword]=useState(""),[error,setError]=useState("");
  useEffect(()=>{api(token,"/messages.php?after=0&limit=100").then(d=>setItems(d.messages.filter(m=>m.attachment_id).reverse())).catch(e=>setError(e.message))},[]);
  const filtered=items.filter(m=>(m.original_name||"").toLowerCase().includes(keyword.trim().toLowerCase()));
  return <div className="adminPage assetPage"><div className="adminPageHeader"><div><span className="overline">文件素材</span><h3>最近文件</h3><p>以素材库形式浏览已上传的图片、视频和文件</p></div><div className="adminPageActions"><Input allowClear value={keyword} onChange={e=>setKeyword(e.target.value)} placeholder="搜索文件名" /></div></div>{error?<Alert type="error" showIcon message={error}/>:<div className="assetGrid">{filtered.map(m=>{const url=`${API}/files.php?id=${m.attachment_id}&token=${encodeURIComponent(token)}`;return <article className="assetCard" key={m.id}>{m.message_type==="image"?<button className="assetImage" onClick={()=>showPreview({url,name:m.original_name})}><img src={url} alt={m.original_name} loading="lazy"/></button>:m.message_type==="video"?<video className="assetVideo" src={url} controls preload="metadata"/>:<a className="assetFile" href={url} target="_blank" rel="noopener noreferrer">{fileBadge(m.original_name)}<strong>{m.original_name}</strong></a>}<div className="assetMeta"><span title={m.original_name}>{m.original_name}</span><small>{new Date(m.created_at.replace(" ","T")+"Z").toLocaleDateString()}</small></div></article>})}{!filtered.length&&<div className="assetEmpty">暂无文件素材</div>}</div>}</div>
}
function PasswordPanel({ token, onClose }) {
  const [oldPassword, setOld] = useState(""), [newPassword, setNew] = useState(""), [error, setError] = useState(""), [done, setDone] = useState(false);
  const submit = async e => { e.preventDefault(); setError(""); try { await api(token, "/users.php?action=change-password", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({old_password:oldPassword,new_password:newPassword}) }); setDone(true); setOld(""); setNew(""); } catch(e) { setError(e.message) } };
  return <div className="adminModal"><div className="adminCard"><button className="modalClose" onClick={onClose}><X size={18}/></button><h3>修改密码</h3><p>修改后请在其他设备重新登录。</p><form onSubmit={submit}><input type="password" placeholder="当前密码" value={oldPassword} onChange={e=>setOld(e.target.value)} required/><input type="password" placeholder="新密码（至少 6 位）" value={newPassword} onChange={e=>setNew(e.target.value)} minLength="6" required/><button className="primaryBtn">保存新密码</button></form>{done&&<div className="successText">密码修改成功</div>}<div className="errorText">{error}</div></div></div>
}
function UserPanel({ token, onClose }) {
  const [users,setUsers]=useState([]),[name,setName]=useState(""),[password,setPassword]=useState(""),[status,setStatus]=useState("active"),[error,setError]=useState(""),[keyword,setKeyword]=useState(""),[page,setPage]=useState(1),[createOpen,setCreateOpen]=useState(false),[editUser,setEditUser]=useState(null);
  const load=()=>api(token,"/users.php?action=list").then(d=>setUsers(d.users)).catch(e=>setError(e.message));
  useEffect(()=>{load()},[]);
  const filtered=users.filter(u=>u.username.toLowerCase().includes(keyword.trim().toLowerCase()));
  const remove=async id=>{setError("");try{await api(token,`/users.php?action=delete&id=${id}`,{method:"POST"});load()}catch(e){setError(e.message)}};
  const rename=async e=>{e.preventDefault();setError("");try{await api(token,`/users.php?action=update&id=${editUser.id}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:name,password,status})});setEditUser(null);setName("");setPassword("");load()}catch(e){setError(e.message)}};
  const columns=[{title:"用户",dataIndex:"username",key:"username",render:(value,record)=><span className="tableUser"><span className="tableAvatar">{value.slice(0,1).toUpperCase()}</span><b>{value}</b></span>},{title:"角色",dataIndex:"is_admin",key:"role",render:value=>value?<Tag color="blue">超级管理员</Tag>:<Tag>普通用户</Tag>},{title:"状态",dataIndex:"status",key:"status",render:value=>value==='disabled'?<Tag color="red">已停用</Tag>:<Tag color="green">正常</Tag>},{title:"创建时间",dataIndex:"created_at",key:"created_at"},{title:"操作",key:"actions",width:150,render:(_,record)=><span className="tableActions"><Button type="link" size="small" icon={<EditOutlined />} onClick={()=>{setName(record.username);setPassword("");setStatus(record.status||"active");setError("");setEditUser(record)}}>编辑</Button>{!record.is_admin&&<Popconfirm title="确定删除这个用户吗？" okText="删除" cancelText="取消" onConfirm={()=>remove(record.id)}><Button type="link" danger size="small" icon={<DeleteOutlined />}>删除</Button></Popconfirm>}</span>}];
  const create=async e=>{e.preventDefault();setError("");try{await api(token,"/users.php?action=create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:name,password:"123456"})});setName("");setCreateOpen(false);load();setPage(1)}catch(e){setError(e.message)}};
  return <div className="adminPage"><div className="adminPageHeader"><div><span className="overline">账号与权限</span><h3>用户管理</h3><p>管理可登录文件互传助手的用户账号</p></div><div className="adminPageActions"><Input allowClear value={keyword} onChange={e=>{setKeyword(e.target.value);setPage(1)}} placeholder="搜索用户名" /><Button type="primary" onClick={()=>{setError("");setCreateOpen(true)}}>创建用户</Button></div></div><div className="adminTableCard"><Table rowKey="id" columns={columns} dataSource={filtered.slice((page-1)*8,page*8)} pagination={false} locale={{emptyText:"暂无用户"}} /><div className="adminPagination"><span>共 {filtered.length} 个用户</span><Pagination current={page} pageSize={8} total={filtered.length} hideOnSinglePage showSizeChanger={false} onChange={setPage} /></div></div>{createOpen&&<div className="adminModal"><div className="adminCard"><button className="modalClose" onClick={()=>setCreateOpen(false)} aria-label="关闭"><X size={18}/></button><h3>创建用户</h3><p>新建账号默认密码为 123456，用户登录后可自行修改。</p><form onSubmit={create}><input value={name} onChange={e=>setName(e.target.value)} placeholder="输入新用户名" required minLength="2"/><button className="primaryBtn" type="submit">创建账号</button>{error&&<div className="errorText">{error}</div>}</form></div></div>}{editUser&&<div className="adminModal"><div className="adminCard"><button className="modalClose" onClick={()=>setEditUser(null)} aria-label="关闭"><X size={18}/></button><h3>编辑用户</h3><p>可修改用户名、登录密码和账号状态；密码留空则不修改。</p><form onSubmit={rename}><input value={name} onChange={e=>setName(e.target.value)} placeholder="输入用户名" required minLength="2"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="新密码（留空则不修改）" minLength="6"/><div className="statusSwitchRow"><span>账号状态</span><span className="statusSwitchControl"><Switch checked={status==="active"} onChange={checked=>setStatus(checked?"active":"disabled")} checkedChildren="正常" unCheckedChildren="停用" /></span></div><button className="primaryBtn" type="submit">保存修改</button>{error&&<div className="errorText">{error}</div>}</form></div></div>}</div>
}
function Chat({ token, user, logout }) {
  const [ms, setMs] = useState([]),
    [text, setText] = useState(""),
    [ok, setOk] = useState(true),
    [drag, setDrag] = useState(false),
    [uploading, setUploading] = useState(false),
    [panel, setPanel] = useState(routePanel),
    last = useRef(0),
    bottom = useRef();
  const goPanel = (value) => {
    setPanel(value);
    window.location.hash = value ? `/${value}` : "";
  };
  const load = async (initial) => {
    try {
      const d = await api(
        token,
        `/messages.php?after=${initial ? 0 : last.current}`,
      );
      if (initial) {
        setMs(d.messages);
        last.current = 0;
      } else setMs((x) => [...x, ...d.messages]);
      d.messages.forEach(
        (m) => (last.current = Math.max(last.current, Number(m.id))),
      );
      setOk(true);
    } catch {
      setOk(false);
    }
  };
  useEffect(() => {
    load(true);
    const t = setInterval(() => load(false), 3000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const onHashChange = () => setPanel(routePanel());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);
  useEffect(() => {
    const list = bottom.current?.parentElement;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
    requestAnimationFrame(() => {
      list.scrollTop = list.scrollHeight;
    });
  }, [ms.length]);
  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText("");
    try {
      await api(token, "/messages.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body, message_type: "text" }),
      });
      load(false);
    } catch (e) {
      alert(e.message);
    }
  };
  const upload = async (fs) => {
    for (const f of fs) {
      setUploading(true);
      const d = new FormData();
      d.append("file", f);
      try {
        await api(token, "/upload.php", { method: "POST", body: d });
        await load(false);
      } catch (e) {
        alert(e.message);
      }
    }
    setUploading(false);
  };
  const drop = (e) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files.length) upload([...e.dataTransfer.files]);
  };
  return (
    <main
      className={`appShell ${drag ? "isDragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={(e) => {
        if (e.clientX <= 0 || e.clientY <= 0) setDrag(false);
      }}
      onDrop={drop}
    >
      <aside className="sideBar">
        <div className="brandLine">
          <div className="appMark small">
            <ArrowLeftRight size={22} strokeWidth={2.4} />
          </div>
          <div>
            <b>文件互传助手</b>
            <small>企业级文件协作空间</small>
          </div>
        </div>
        <div className="spaceCard">
          <span className="spaceIcon">⇄</span>
          <span>
            <b>文件互传记录</b>
            <small>跨设备安全互传</small>
          </span>
          <i className="onlineDot" />
        </div>
        <div className="sideTitle">工作区</div>
        <button className={`navItem navButton ${!panel ? "selected" : ""}`} onClick={()=>goPanel(null)}>
          <File size={16} />
          全部记录<em>{ms.length || "—"}</em>
        </button>
        <button className={`navItem navButton ${panel === "assets" ? "selected" : ""}`} onClick={()=>goPanel("assets")}>
          <FileImage size={16} />
          最近文件
        </button>
        {user.is_admin && <button className={`navItem navButton ${panel === "users" ? "selected" : ""}`} onClick={()=>goPanel("users")}><ShieldCheck size={16}/>用户管理</button>}
        <div className="sideUser">
          <span className="avatar">
            {user.username.slice(0, 1).toUpperCase()}
          </span>
          <span className="accountIdentity">
            <b>{user.username}</b>
            <small><i />个人账户</small>
          </span>
          <span className="accountActions">
            <Tooltip title="修改密码" placement="top">
              <Button className="passwordButton" type="text" shape="circle" icon={<KeyOutlined />} onClick={()=>goPanel("password")} aria-label="修改密码" />
            </Tooltip>
            <Tooltip title="退出登录" placement="top">
              <Button className="logoutButton" type="text" shape="circle" icon={<LogOut size={17} />} onClick={logout} aria-label="退出登录" />
            </Tooltip>
          </span>
        </div>
      </aside>
      <section className="chatPanel">
        <header className="chatHeader">
          <div>
            <span className="overline">安全文件空间</span>
            <h2>文件互传记录</h2>
            <p>在已登录设备之间即时传输，历史记录永久保留</p>
          </div>
          <span className={`connection ${ok ? "" : "offline"}`}>
            <Wifi size={14} />
            {ok ? "已连接" : "连接异常"}
          </span>
        </header>
        <nav className="mobileNav" aria-label="移动端导航">
          <button className={!panel ? "selected" : ""} onClick={()=>goPanel(null)}><File size={16}/>全部记录</button>
          <button className={panel === "assets" ? "selected" : ""} onClick={()=>goPanel("assets")}><FileImage size={16}/>最近文件</button>
          {user.is_admin && <button className={panel === "users" ? "selected" : ""} onClick={()=>goPanel("users")}><ShieldCheck size={16}/>用户管理</button>}
        </nav>
        <div className="messageList">
          {!ms.length && (
            <div className="emptyState">
              <div>
                <Upload size={23} />
              </div>
              <b>开始你的第一次传输</b>
              <p>将文件拖到这里，或在下方输入消息</p>
            </div>
          )}
          {ms.map((m) => (
            <Message key={m.id} m={m} token={token} />
          ))}
          <div ref={bottom} />
        </div>
        <div className="dropOverlay">
          <Upload size={30} />
          <b>松开鼠标即可添加文件</b>
          <span>松开后立即开始上传</span>
        </div>
        <footer className="composer">
          <div className="composerTools">
            <label className="attachButton">
              <Paperclip size={18} />
              <input
                type="file"
                multiple
                onChange={(e) => {
                  upload([...e.target.files]);
                  e.target.value = "";
                }}
              />
            </label>
            <span>{uploading ? "正在上传…" : "支持图片、视频及任意文件"}</span>
          </div>
          <textarea
            rows="4"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.ctrlKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder="输入消息，粘贴链接也可以…"
          />
          <div className="composerFooter">
            <span>Enter 发送 · Ctrl + Enter 换行</span>
            <button className="sendButton" onClick={send}>
              发送
              <Send size={15} />
            </button>
          </div>
        </footer>
      </section>
      {panel === "password" && <PasswordPanel token={token} onClose={()=>goPanel(null)}/>} {panel === "users" && user.is_admin && <UserPanel token={token} onClose={()=>goPanel(null)}/>} {panel === "assets" && <AssetPanel token={token} onClose={()=>goPanel(null)}/>} 
    </main>
  );
}
function App() {
  const [a, setA] = useState({
    token: localStorage.getItem("fh_token"),
    user: savedUser,
  });
  const logout = () => {
    localStorage.clear();
    window.location.hash = "";
    setA({ token: null, user: null });
  };
  return a.token && a.user ? (
    <Chat {...a} logout={logout} />
  ) : (
    <Auth login={(token, user) => setA({ token, user })} />
  );
}
createRoot(document.getElementById("root")).render(<App />);
