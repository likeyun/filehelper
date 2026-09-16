# 文件互传助手

一个面向个人、团队和内网环境的 Web 文件互传工具。它提供类似聊天软件的操作体验，同时永久保留文字、图片、视频和任意文件的传输记录，适合在电脑、手机和其他已登录设备之间快速交换资料。

## 功能特性

- 文字、图片、视频和任意后缀文件互传
- 图片直接预览，视频直接播放，常见文件自动显示类型图标
- HTTP/HTTPS 链接自动转换为可点击链接
- 支持桌面端拖拽上传和多文件上传
- 消息记录永久保留，可按时间浏览
- 最近文件素材库，支持文件名搜索
- 文本消息一键复制，兼容移动端复制场景
- 图片懒加载、浏览器缓存和 ETag 缓存，减少重复下载
- 响应式移动端界面，适配手机浏览器安全区域
- Ant Design 组件与液态玻璃视觉风格
- 管理员用户管理：创建、编辑、停用和删除普通用户
- 用户可自行修改密码
- Hash 路由支持，刷新页面后保留当前功能页面
- Web-only 部署方式，无需安装桌面客户端

## 技术栈

前端：React 18、Vite、Ant Design、Ant Design Icons、lucide-react。

后端：原生 PHP 8+、MySQL 5.7+/MariaDB、Bearer Token 会话认证。

## 项目结构

```text
filehelper/
├─ client/                 # React/Vite 前端
│  ├─ src/main.jsx         # 应用入口与页面逻辑
│  ├─ src/styles.css       # 全局及响应式样式
│  ├─ public/favicon.png   # 网站图标
│  └─ package.json
├─ server/                 # PHP API
│  ├─ auth.php             # 登录接口
│  ├─ users.php            # 用户与密码接口
│  ├─ messages.php         # 消息接口
│  ├─ upload.php           # 文件上传接口
│  ├─ files.php            # 文件读取接口
│  ├─ schema.sql           # 数据库结构
│  └─ config.example.php
├─ deploy-package/         # Web 部署目录
└─ README.md
```

## 本地开发

环境要求：Node.js 18+、npm 9+、PHP 8+、MySQL 5.7+ 或 MariaDB。

```bash
cd client
npm install
npm run dev
```

Vite 默认地址通常为 `http://localhost:5173`。开发时可通过 `VITE_API_BASE` 指定 API 地址：

```bash
VITE_API_BASE=http://localhost:8080/api npm run dev
```

生产构建：

```bash
cd client
npm run build
```

构建产物位于 `client/dist/`。

## Web 部署

1. 将 `client/dist/` 中的文件复制到网站根目录。
2. 将 `server/` 内容复制到网站根目录下的 `api/` 目录。
3. 创建 MySQL 数据库，并确保 PHP 用户拥有该数据库的建表、读写权限。
4. 复制 `api/config.example.php` 为 `api/config.php`，填写数据库配置。
5. 确保 `api/storage/uploads/` 可写。
6. 访问 `/install.php`，按向导创建数据库表和管理员账号。
7. 安装成功后立即删除网站根目录下的 `install.php`。

安装页只预填数据库服务器 `127.0.0.1`，数据库名、数据库账号、数据库密码、管理员账号和管理员密码均需由部署者填写，不会继承旧站点数据。

> 安装向导用于全新部署，会清理本应用的相关数据表和上传文件。不要在已有正式数据的环境中重复执行。

## Nginx 示例

前端需要将未知路径回退到 `index.html`，API 目录交给 PHP-FPM 处理。项目提供了参考配置：`server/nginx-location.conf`。

```nginx
location / {
    try_files $uri $uri/ /index.html;
}

location ~ ^/api/.*\.php$ {
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    fastcgi_pass unix:/run/php/php8.2-fpm.sock;
}
```

## 权限模型

- 系统不开放普通用户注册。
- 管理员由安装向导创建，或由超级管理员创建普通账号。
- 新建普通账号的初始密码为 `123456`，用户首次登录后应立即修改密码。
- 超级管理员可以创建、编辑、停用和删除普通用户。
- 超级管理员账号不能被管理操作删除或停用。
- 停用账号无法登录，但历史文件和消息记录不会自动删除。

## API 概览

需要登录的接口使用：

```http
Authorization: Bearer <token>
```

| 接口 | 方法 | 说明 |
| --- | --- | --- |
| `/api/auth.php?action=login` | POST | 用户登录 |
| `/api/messages.php` | GET/POST | 获取或发送文字消息 |
| `/api/upload.php` | POST | 上传图片、视频和文件 |
| `/api/files.php?id=<id>` | GET | 读取文件内容 |
| `/api/users.php?action=list` | GET | 管理员获取用户列表 |
| `/api/users.php?action=create` | POST | 管理员创建普通用户 |
| `/api/users.php?action=update&id=<id>` | POST | 编辑用户名、密码和状态 |
| `/api/users.php?action=delete&id=<id>` | POST | 删除普通用户 |
| `/api/users.php?action=change-password` | POST | 当前用户修改密码 |

文件接口会返回私有缓存响应，并使用 ETag 和 Last-Modified 减少相同文件的重复传输。文件权限仍由登录会话校验，不能仅凭文件 ID 访问其他用户文件。

## 安全建议

- 生产环境必须启用 HTTPS。
- 不要把 `api/config.php`、SSH 私钥或数据库密码提交到 Git。
- 安装完成后必须删除 `install.php`。
- 定期备份 MySQL 数据库和 `api/storage/uploads/`。
- 建议限制单文件大小、上传目录执行权限和 PHP 上传类型。
- 生产环境不要使用数据库 root 账号连接应用。
- 建议为管理员使用高强度密码，并定期轮换部署密钥。

## 许可证

本项目默认采用 MIT License。正式发布前，请将版权持有人、项目主页、Issue 地址和完整 `LICENSE` 文件补充完整。

```text
MIT License
Copyright (c) 2026
```
